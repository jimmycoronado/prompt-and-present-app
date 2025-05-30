
import { User, Clock, Download, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { DataTable } from "./DataTable";
import { DataChart } from "./DataChart";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: ChatMessageType;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSelected, onClick }) => {
  const isUser = message.type === 'user';
  const { toast } = useToast();

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
    // TODO: Implementar cuando se conecte Supabase
    toast({
      title: "Feedback registrado",
      description: `Gracias por tu ${type === 'positive' ? 'valoración positiva' : 'comentario'}`,
    });
  };

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
      }`}
      onClick={onClick}
      role="article"
      aria-label={`Mensaje de ${isUser ? 'usuario' : 'asistente'}`}
    >
      <div className={`max-w-4xl w-full ${isUser ? 'flex flex-row-reverse' : 'flex'} space-x-3 space-x-reverse`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-white">
              <User className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <img 
                src="https://www.skandia.com.mx/mercadeo/2021/campana/Sami/Mail/Sami/Thinking2.gif" 
                alt="Sami"
                className="w-6 h-6 object-contain"
              />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block rounded-lg p-4 shadow-sm border ${
            isUser
              ? 'bg-gray-700 text-white border-gray-700'
              : 'bg-skandia-green text-white border-skandia-green'
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            
            {/* Text Content */}
            {message.content && (
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            )}

            {/* Files */}
            {message.files && message.files.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      isUser 
                        ? 'bg-gray-600' 
                        : 'bg-skandia-green/80'
                    }`}
                  >
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs opacity-75">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Data Table */}
            {message.data && (
              <div className="mt-4">
                <DataTable data={message.data} />
              </div>
            )}

            {/* Chart */}
            {message.chart && (
              <div className="mt-4">
                <DataChart chartData={message.chart} />
              </div>
            )}

            {/* Download Link */}
            {message.downloadLink && (
              <div className="mt-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-skandia-green"
                >
                  <a href={message.downloadLink.url} download>
                    <Download className="h-4 w-4 mr-2" />
                    {message.downloadLink.filename}
                  </a>
                </Button>
              </div>
            )}

            {/* Actions for Assistant Messages */}
            {!isUser && message.content && (
              <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyText();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Copiar mensaje"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeedback('positive');
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/10"
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
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="No me gusta esta respuesta"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock className="h-3 w-3 mr-1" />
            <time dateTime={message.timestamp.toISOString()}>
              {message.timestamp.toLocaleTimeString()}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};
