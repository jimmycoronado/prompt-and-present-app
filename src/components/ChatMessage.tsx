
import { User, Download, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { DataTable } from "./DataTable";
import { DataChart } from "./DataChart";
import { VideoPreview } from "./VideoPreview";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPhoto } from "@/hooks/useUserPhoto";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSelected, onClick }) => {
  const isUser = message.type === 'user';
  const { toast } = useToast();
  const { user } = useAuth();
  const { photoUrl } = useUserPhoto();
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Ensure timestamp is a Date object - safety check
  const ensureValidTimestamp = (timestamp: any): Date => {
    if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    console.warn('Invalid timestamp in ChatMessage:', timestamp, 'using current time');
    return new Date();
  };

  const validTimestamp = ensureValidTimestamp(message.timestamp);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Texto copiado",
        description: "El contenido se ha copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el texto al portapapeles",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    // TODO: Implementar cuando se conecte Supabase
    toast({
      title: "Feedback registrado",
      description: `Gracias por tu ${type === 'positive' ? 'valoración positiva' : 'comentario'}`,
    });
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Crear un enlace temporal para forzar la descarga
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del objeto
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Descarga iniciada",
        description: `Se está descargando ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Error en la descarga",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  };

  // Generar iniciales del usuario
  const getUserInitials = () => {
    if (!user) return 'U';
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.name ||
                       'Usuario';
    return displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  console.log('ChatMessage: Rendering message with videoPreview:', message.videoPreview);
  console.log('ChatMessage: Message object:', message);

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all duration-200`}
      role="article"
      aria-label={`Mensaje de ${isUser ? 'usuario' : 'asistente'}`}
    >
      <div className={`max-w-full w-full ${isUser ? 'flex flex-row-reverse' : 'flex'} space-x-3 space-x-reverse`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <Avatar className="w-8 h-8">
              {photoUrl && (
                <AvatarImage src={photoUrl} alt={user?.name || 'Usuario'} />
              )}
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 rounded-full bg-transparent overflow-hidden">
              <img 
                src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif" 
                alt="Dali AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'} relative`}>
          {/* Main message container */}
          <div 
            className={`group ${isUser ? 'pb-2' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Text Content Container */}
            {message.content && (
              <div 
                className={`inline-block p-4 relative max-w-[700px] ${
                  isUser
                    ? 'rounded-lg bg-skandia-green text-white border border-skandia-green shadow-sm'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* Files dentro del mensaje de usuario */}
                {isUser && message.files && message.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 rounded bg-skandia-green/80"
                      >
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs opacity-75">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Preview and Download Link dentro del mensaje de usuario */}
                {isUser && message.downloadLink && (
                  <div className="mt-4">
                    {/* Image Preview */}
                    <div className="mb-3">
                      <img 
                        src={message.downloadLink.url} 
                        alt="Vista previa"
                        className="max-w-xs rounded border shadow-sm border-white/20"
                        style={{ maxHeight: '200px', width: 'auto' }}
                      />
                    </div>
                    
                    {/* Download Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-skandia-green hover:bg-gray-100 border border-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(message.downloadLink!.url, message.downloadLink!.filename);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {message.downloadLink.filename}
                    </Button>
                  </div>
                )}

                {/* Actions for Assistant Messages dentro del bubble */}
                {!isUser && message.content && (
                  <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {/* Copy Button for Agent Messages - Always visible */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyText();
                      }}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Copiar mensaje"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback('positive');
                        }}
                        className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          feedback === 'positive' 
                            ? 'text-green-500 hover:text-green-600' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                        aria-label="Me gusta esta respuesta"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback('negative');
                        }}
                        className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          feedback === 'negative' 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                        aria-label="No me gusta esta respuesta"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Copy Button for User Messages - Positioned just below the bubble but above timestamp */}
            {isUser && message.content && (
              <div className={`${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 flex justify-end mt-1 mb-0`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyText();
                  }}
                  className="h-8 w-8 p-0 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
                  aria-label="Copiar mensaje"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Data components OUTSIDE message bubble for full width */}
          {/* Data Table fuera del bubble para aprovechar todo el ancho disponible */}
          {message.data && !isUser && (
            <div className="mt-4 w-full">
              <DataTable data={message.data} />
            </div>
          )}

          {/* Chart fuera del bubble */}
          {message.chart && !isUser && (
            <div className="mt-4">
              <DataChart chartData={message.chart} />
            </div>
          )}

          {/* Video Preview fuera del bubble */}
          {message.videoPreview && !isUser && (
            <div className="mt-4">
              <VideoPreview video={message.videoPreview} />
            </div>
          )}

          {/* Files y Download Link fuera del bubble para mensajes del asistente */}
          {!isUser && message.files && message.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {message.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 rounded bg-gray-100 dark:bg-gray-800"
                >
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs opacity-75">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {!isUser && message.downloadLink && (
            <div className="mt-4">
              {/* Image Preview */}
              <div className="mb-3">
                <img 
                  src={message.downloadLink.url} 
                  alt="Vista previa"
                  className="max-w-xs rounded border shadow-sm border-gray-200 dark:border-gray-700"
                  style={{ maxHeight: '200px', width: 'auto' }}
                />
              </div>
              
              {/* Download Button */}
              <Button
                variant="secondary"
                size="sm"
                className="bg-skandia-green text-white hover:bg-skandia-green/80"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(message.downloadLink!.url, message.downloadLink!.filename);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                {message.downloadLink.filename}
              </Button>
            </div>
          )}

          {/* Timestamp */}
          <div className={`mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex items-center ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <time dateTime={validTimestamp.toISOString()}>
              {validTimestamp.toLocaleTimeString()}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};
