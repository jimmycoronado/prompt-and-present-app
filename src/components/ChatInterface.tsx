
import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { FileUpload } from "./FileUpload";
import { mockApiCall } from "../utils/mockApi";
import { ChatMessage as ChatMessageType } from "../types/chat";

interface ChatInterfaceProps {
  onSelectMessage: (message: ChatMessageType | null) => void;
  selectedMessage: ChatMessageType | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSelectMessage, 
  selectedMessage 
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      files: uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUploadedFiles([]);

    try {
      // Simular llamada a API externa
      const response = await mockApiCall(content, uploadedFiles);
      
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.text || '',
        timestamp: new Date(),
        data: response.data,
        chart: response.chart,
        downloadLink: response.downloadLink,
        metadata: {
          processingTime: response.processingTime || Math.random() * 2000 + 500,
          model: 'gpt-4-turbo',
          tokensUsed: Math.floor(Math.random() * 1000) + 100
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
        metadata: {
          processingTime: 0,
          model: 'error',
          tokensUsed: 0
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4" role="main" aria-label="Conversación">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¡Hola! ¿En qué puedo ayudarte hoy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Puedes hacerme preguntas, subir archivos para analizar, o pedirme que genere gráficas y tablas de datos.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isSelected={selectedMessage?.id === message.id}
            onClick={() => onSelectMessage(message)}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start" role="status" aria-live="polite" aria-label="Procesando respuesta">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1" aria-hidden="true">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Procesando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4" aria-label="Archivos seleccionados">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                  className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={`Remover archivo ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <FileUpload onFilesUploaded={setUploadedFiles} />
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
