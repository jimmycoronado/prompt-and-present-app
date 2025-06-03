
import { useState } from "react";
import { Copy, Download, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { DataTable } from "./DataTable";
import { DataChart } from "./DataChart";
import { VideoPreview } from "./VideoPreview";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: ChatMessageType;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ChatMessage = ({ message, isSelected, onClick }: ChatMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Texto copiado al portapapeles",
      });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: "Error",
        description: "No se pudo copiar el texto",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isUser = message.type === 'user';

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
      }`}
      onClick={onClick}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-4xl`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-skandia-green text-white flex items-center justify-center text-sm font-medium">
              U
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-transparent overflow-hidden">
              <img 
                src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif" 
                alt="Dali AI Avatar" 
                className="w-full h-full object-contain rounded-full bg-transparent"
              />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'mr-3' : 'ml-3'}`}>
          <div
            className={`rounded-lg p-4 shadow-sm border relative group ${
              isUser 
                ? 'bg-skandia-green text-white border-skandia-green/20' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Copy button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(message.content);
              }}
              className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isUser ? 'text-white hover:bg-white/20' : 'text-gray-500'
              }`}
              title="Copiar mensaje"
            >
              <Copy size={16} />
            </button>

            {/* Message content */}
            <div className="pr-8">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>

            {/* Files attached to user message */}
            {message.files && message.files.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.files.map((file, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      isUser ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="text-sm">📎 {file.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Data table */}
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

            {/* Video preview */}
            {message.videoPreview && (
              <div className="mt-4">
                <VideoPreview video={message.videoPreview} />
              </div>
            )}

            {/* Download link */}
            {message.downloadLink && (
              <div className="mt-4">
                <Button
                  onClick={() => handleDownload(message.downloadLink!.url, message.downloadLink!.filename)}
                  className="flex items-center space-x-2"
                  variant="outline"
                >
                  <Download size={16} />
                  <span>Descargar {message.downloadLink.filename}</span>
                </Button>
              </div>
            )}

            {/* Metadata */}
            {message.metadata && !isUser && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>Modelo: {message.metadata.model}</div>
                <div>Tiempo: {Math.round(message.metadata.processingTime)}ms</div>
                <div>Tokens: {message.metadata.tokensUsed}</div>
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
