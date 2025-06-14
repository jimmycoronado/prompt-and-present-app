import { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Camera, CameraOff, MoreVertical, Type, Image, Camera as CameraIcon, Share, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { ChatMessage } from '@/types/chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface VoiceModeProps {
  onClose: () => void;
  onMessage: (message: ChatMessage) => void;
  onError?: (error: string) => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onClose, onMessage, onError }) => {
  const logoRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [showCaptions, setShowCaptions] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // Estados simulados para la interfaz (hasta que se configure OpenAI Realtime)
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  // Check for multiple cameras on mount
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
        console.log('Available cameras:', videoDevices.length);
      } catch (error) {
        console.log('Could not enumerate devices:', error);
      }
    };

    checkCameras();
  }, []);

  // Simulación de conexión (remover cuando se implemente OpenAI Realtime)
  useEffect(() => {
    console.log('VoiceMode: Simulando estado de conexión...');
    const timer = setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Modo demostración",
        description: "La funcionalidad de voz estará disponible cuando se configure OpenAI Realtime API",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Efecto visual para el logo basado en el estado
  useEffect(() => {
    if (!logoRef.current) return;

    const logo = logoRef.current;
    
    if (isSpeaking) {
      logo.style.animation = 'pulse 1.5s infinite, scale-speaking 0.8s infinite alternate';
    } else if (isRecording && !isMuted) {
      logo.style.animation = 'scale-recording 0.6s infinite alternate, glow-recording 1s infinite alternate';
    } else if (isConnected) {
      logo.style.animation = 'breathe 3s infinite';
    } else {
      logo.style.animation = 'none';
    }
  }, [isConnected, isRecording, isSpeaking, isMuted]);

  // Set up video stream when camera is enabled
  useEffect(() => {
    if (isCameraEnabled && userStream && videoRef.current) {
      console.log('Setting up video stream');
      videoRef.current.srcObject = userStream;
      
      // Ensure video plays
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      };
    }
  }, [isCameraEnabled, userStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userStream]);

  const startCamera = async (facing: 'user' | 'environment' = 'user') => {
    setCameraError(null);
    
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }

      const constraints = {
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facing
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera stream obtained:', stream.getVideoTracks().length, 'video tracks');
      setUserStream(stream);
      setFacingMode(facing);
      
      // Removed toast notification for camera activation
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(error instanceof Error ? error.message : 'Error desconocido');
      
      let errorMessage = "No se pudo acceder a la cámara";
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Permiso de cámara denegado. Por favor, permite el acceso a la cámara.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No se encontró ninguna cámara en el dispositivo.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "La cámara está siendo usada por otra aplicación.";
        } else if (error.name === 'OverconstrainedError') {
          // If specific facing mode fails, try with the other one
          if (facing === 'environment') {
            console.log('Environment camera not available, trying user camera');
            return startCamera('user');
          }
        }
      }
      
      toast({
        title: "Error de cámara",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const handleCameraToggle = async () => {
    if (isCameraEnabled) {
      // Disable camera
      console.log('Disabling camera');
      if (userStream) {
        userStream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
        setUserStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraEnabled(false);
      setCameraError(null);
    } else {
      // Enable camera
      console.log('Enabling camera');
      try {
        await startCamera(facingMode);
        setIsCameraEnabled(true);
      } catch (error) {
        // Error already handled in startCamera
      }
    }
  };

  const handleCameraSwitch = async () => {
    if (!userStream) return;

    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    
    // Stop current stream
    userStream.getTracks().forEach(track => track.stop());
    
    try {
      await startCamera(newFacingMode);
    } catch (error) {
      // If switching fails, try to restart with original facing mode
      try {
        await startCamera(facingMode);
      } catch (restartError) {
        setIsCameraEnabled(false);
        setUserStream(null);
      }
    }
  };

  const handleVideoClick = () => {
    console.log('Video clicked, hasMultipleCameras:', hasMultipleCameras, 'isCameraEnabled:', isCameraEnabled);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Simular grabación cuando no está silenciado
    if (isMuted) {
      setIsRecording(true);
      setTimeout(() => setIsRecording(false), 2000);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Archivo seleccionado",
        description: `Archivo: ${file.name}`,
      });
      // Here you would implement file processing logic
    }
  };

  const handleTakePhoto = async () => {
    if (!userStream || !videoRef.current) {
      toast({
        title: "Cámara no disponible",
        description: "Activa la cámara primero para tomar una foto",
        variant: "destructive"
      });
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Wait for video to be ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('El video no está listo');
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          toast({
            title: "Foto capturada",
            description: "La foto ha sido tomada exitosamente",
          });
          // Here you would implement photo processing logic
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Error",
        description: "No se pudo tomar la foto",
        variant: "destructive"
      });
    }
  };

  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      toast({
        title: "Pantalla compartida",
        description: "Se ha iniciado la compartición de pantalla",
      });
      
      // Here you would implement screen sharing logic
      stream.getTracks().forEach(track => {
        track.onended = () => {
          toast({
            title: "Compartición finalizada",
            description: "Se ha detenido la compartición de pantalla",
          });
        };
      });
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "Error",
        description: "No se pudo compartir la pantalla",
        variant: "destructive"
      });
    }
  };

  const getStatusText = () => {
    if (!isConnected) return 'Modo demostración - Configura OpenAI Realtime para voz';
    if (isMuted) return 'Micrófono silenciado';
    if (isSpeaking) return 'Dali está hablando...';
    if (isRecording) return 'Escuchando...';
    return 'Toca para hablar';
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-yellow-500';
    if (isMuted) return 'text-red-500';
    if (isSpeaking) return 'text-blue-500';
    if (isRecording) return 'text-green-500';
    return 'text-gray-700 dark:text-gray-300';
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
          {/* Logo de Dali con efectos - se desplaza hacia arriba cuando la cámara está activa */}
          <div className={`relative mb-8 transition-all duration-500 ${isCameraEnabled ? 'md:-translate-y-20 -translate-y-12' : ''}`}>
            {/* Círculos de fondo para el efecto visual */}
            <div className="absolute inset-0 -m-8">
              <div className={`w-32 h-32 rounded-full border-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isRecording && !isMuted ? 'border-green-400 animate-ping' : 'border-transparent'
              }`} />
              <div className={`w-40 h-40 rounded-full border-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isSpeaking ? 'border-blue-400 animate-ping' : 'border-transparent'
              }`} />
              <div className={`w-48 h-48 rounded-full border-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isSpeaking ? 'border-blue-300 animate-ping animation-delay-600' : 'border-transparent'
              }`} />
            </div>

            {/* Logo principal */}
            <div className="w-24 h-24 rounded-full bg-white p-4 shadow-2xl relative z-10">
              <img 
                ref={logoRef}
                src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif" 
                alt="Dali AI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Vista de la cámara del usuario - Mucho más grande como ChatGPT */}
          {isCameraEnabled && (
            <div className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black max-w-4xl max-h-[70vh] mx-auto">
              <div className="relative w-full h-full">
                {userStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        facingMode === 'user' ? 'scale-x-[-1]' : ''
                      }`}
                    />
                    {/* Botón de cambiar cámara - siempre visible en esquina inferior derecha */}
                    {hasMultipleCameras && (
                      <div className="absolute bottom-4 right-4 z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCameraSwitch}
                          className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                          aria-label="Cambiar cámara"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      {cameraError ? (
                        <>
                          <CameraOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg opacity-75 mb-2">Error de cámara</p>
                          <p className="text-sm opacity-60">{cameraError}</p>
                        </>
                      ) : (
                        <>
                          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg opacity-75">Cargando cámara...</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Texto de estado */}
          <div className={`text-center transition-all duration-500 ${isCameraEnabled ? 'mb-4' : 'mb-16'}`}>
            <h2 className="text-2xl font-semibold text-white mb-2">Modo de Voz</h2>
            <p className={`text-lg ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            
            {isConnected && !isSpeaking && !isMuted && !isCameraEnabled && (
              <p className="text-sm text-gray-400 mt-4 max-w-md text-center">
                Habla naturalmente con Dali. La conversación se transcribirá automáticamente.
              </p>
            )}

            {/* Captions cuando están habilitadas */}
            {showCaptions && (
              <div className="mt-4 p-3 bg-black/50 rounded-lg max-w-md mx-auto">
                <p className="text-white text-sm">
                  {isSpeaking ? "Dali está respondiendo..." : isRecording ? "Escuchando..." : ""}
                </p>
              </div>
            )}
          </div>

          {/* Controles inferiores estilo ChatGPT */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            {/* Botón de cámara */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCameraToggle}
              className={`w-12 h-12 rounded-full ${
                isCameraEnabled 
                  ? 'bg-blue-500/30 text-blue-400 hover:bg-blue-500/40' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              } backdrop-blur-sm transition-all`}
              aria-label={isCameraEnabled ? "Desactivar cámara" : "Activar cámara"}
            >
              {isCameraEnabled ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
            </Button>

            {/* Botón de micrófono */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className={`w-12 h-12 rounded-full ${
                isMuted 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              } backdrop-blur-sm transition-all`}
              aria-label={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Menú de opciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                  aria-label="Más opciones"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="center" 
                side="top" 
                className="mb-2 bg-black/80 backdrop-blur-sm border-white/20 text-white"
              >
                <DropdownMenuItem 
                  onClick={() => setShowCaptions(!showCaptions)}
                  className="hover:bg-white/10 focus:bg-white/10"
                >
                  <Type className="h-4 w-4 mr-2" />
                  {showCaptions ? 'Ocultar subtítulos' : 'Mostrar subtítulos'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleFileUpload}
                  className="hover:bg-white/10 focus:bg-white/10"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Cargar imagen
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleTakePhoto}
                  className="hover:bg-white/10 focus:bg-white/10"
                  disabled={!isCameraEnabled || !userStream}
                >
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Tomar foto
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleShareScreen}
                  className="hover:bg-white/10 focus:bg-white/10"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Compartir pantalla
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón de cerrar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
              aria-label="Cerrar modo de voz"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Indicador de conexión - movido a esquina inferior izquierda */}
          <div className="absolute bottom-8 left-8">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>

          {/* Input oculto para cargar archivos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Estilos CSS para las animaciones */}
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes scale-speaking {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          
          @keyframes scale-recording {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
          }
          
          @keyframes glow-recording {
            0% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
            100% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.6); }
          }
          
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
          
          .animation-delay-600 {
            animation-delay: 0.6s;
          }
        `}
      </style>
    </>
  );
};
