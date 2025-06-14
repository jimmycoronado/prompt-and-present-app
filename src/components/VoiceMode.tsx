
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { ChatMessage } from '@/types/chat';

interface VoiceModeProps {
  onClose: () => void;
  onMessage: (message: ChatMessage) => void;
  onError?: (error: string) => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onClose, onMessage, onError }) => {
  const logoRef = useRef<HTMLImageElement>(null);

  const { isConnected, isRecording, isSpeaking, connect, disconnect } = useRealtimeVoice({
    onMessage: (audioMessage) => {
      const chatMessage: ChatMessage = {
        id: audioMessage.id,
        type: audioMessage.type,
        content: audioMessage.content,
        timestamp: audioMessage.timestamp,
        metadata: audioMessage.type === 'assistant' ? {
          processingTime: 0,
          model: 'gpt-4o-realtime',
          tokensUsed: 0
        } : undefined
      };
      onMessage(chatMessage);
    },
    onError
  });

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Efecto visual para el logo basado en el estado
  useEffect(() => {
    if (!logoRef.current) return;

    const logo = logoRef.current;
    
    if (isSpeaking) {
      // Efecto de pulsación cuando la IA habla
      logo.style.animation = 'pulse 1.5s infinite, scale-speaking 0.8s infinite alternate';
    } else if (isRecording) {
      // Efecto de ondas cuando el usuario habla
      logo.style.animation = 'scale-recording 0.6s infinite alternate, glow-recording 1s infinite alternate';
    } else if (isConnected) {
      // Efecto suave cuando está conectado pero en reposo
      logo.style.animation = 'breathe 3s infinite';
    } else {
      // Sin animación cuando está desconectado
      logo.style.animation = 'none';
    }
  }, [isConnected, isRecording, isSpeaking]);

  const getStatusText = () => {
    if (!isConnected) return 'Conectando...';
    if (isSpeaking) return 'Dali está hablando...';
    if (isRecording) return 'Escuchando...';
    return 'Toca para hablar';
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-gray-500';
    if (isSpeaking) return 'text-blue-500';
    if (isRecording) return 'text-green-500';
    return 'text-gray-700 dark:text-gray-300';
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
          {/* Botón de cerrar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-8 right-8 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Logo de Dali con efectos */}
          <div className="relative mb-8">
            {/* Círculos de fondo para el efecto visual */}
            <div className="absolute inset-0 -m-8">
              <div className={`w-32 h-32 rounded-full border-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isRecording ? 'border-green-400 animate-ping' : 'border-transparent'
              }`} />
              <div className={`w-40 h-40 rounded-full border-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isSpeaking ? 'border-blue-400 animate-ping animation-delay-300' : 'border-transparent'
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

          {/* Texto de estado */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Modo de Voz</h2>
            <p className={`text-lg ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            
            {isConnected && !isSpeaking && (
              <p className="text-sm text-gray-400 mt-4 max-w-md text-center">
                Habla naturalmente con Dali. La conversación se transcribirá automáticamente.
              </p>
            )}
          </div>

          {/* Indicador de conexión */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
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
