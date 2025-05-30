import { useState, useRef, useEffect } from "react";
import { History, File, Download } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { FileUpload } from "./FileUpload";
import { ConversationHistory } from "./ConversationHistory";
import { PromptTemplates } from "./PromptTemplates";
import { mockApiCall } from "../utils/mockApi";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { PromptTemplate } from "../types/templates";
import { useConversation } from "../contexts/ConversationContext";
import { useSettings } from "../contexts/SettingsContext";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  onSelectMessage: (message: ChatMessageType | null) => void;
  selectedMessage: ChatMessageType | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSelectMessage, 
  selectedMessage 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { 
    currentConversation, 
    addMessageToCurrentConversation, 
    createNewConversation 
  } = useConversation();
  const { aiSettings } = useSettings();

  const messages = currentConversation?.messages || [];

  // Log messages array changes
  useEffect(() => {
    console.log('ChatInterface: Messages array updated:', messages.length, messages);
  }, [messages]);

  // Log currentConversation changes
  useEffect(() => {
    console.log('ChatInterface: Current conversation changed:', currentConversation?.id, currentConversation?.messages?.length);
  }, [currentConversation]);

  // Crear nueva conversación si no existe una actual
  useEffect(() => {
    if (!currentConversation) {
      console.log('ChatInterface: Creating new conversation');
      createNewConversation();
    }
  }, [currentConversation, createNewConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && uploadedFiles.length === 0) return;
    if (!currentConversation) return;

    console.log('ChatInterface: START handleSendMessage with content:', content);
    console.log('ChatInterface: Current conversation before adding message:', currentConversation?.id, currentConversation?.messages?.length);

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

    console.log('ChatInterface: Created user message:', userMessage);
    
    // Add user message immediately
    addMessageToCurrentConversation(userMessage);
    console.log('ChatInterface: Called addMessageToCurrentConversation for user message');
    
    setIsLoading(true);
    setUploadedFiles([]);
    
    // Clear template content after sending
    setTimeout(() => {
      console.log('ChatInterface: Clearing template content');
      setTemplateContent("");
    }, 100);

    try {
      console.log('ChatInterface: Calling mockApiCall...');
      const response = await mockApiCall(content, uploadedFiles, aiSettings);
      console.log('ChatInterface: Received API response:', response);
      
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
          model: aiSettings.model,
          tokensUsed: Math.floor(Math.random() * 1000) + 100
        }
      };

      console.log('ChatInterface: Created AI message:', aiMessage);
      
      // Use setTimeout to ensure the user message is fully processed first
      setTimeout(() => {
        console.log('ChatInterface: Adding AI message after delay');
        addMessageToCurrentConversation(aiMessage);
      }, 50);
      
    } catch (error) {
      console.error('ChatInterface: Error in mockApiCall:', error);
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
      setTimeout(() => {
        addMessageToCurrentConversation(errorMessage);
      }, 50);
    } finally {
      setIsLoading(false);
      console.log('ChatInterface: END handleSendMessage');
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    console.log('ChatInterface: Template selected:', template.content);
    setTemplateContent(template.content);
    setShowTemplates(false);
  };

  const handleExportConversation = () => {
    if (!currentConversation || messages.length === 0) {
      toast({
        title: "No hay conversación",
        description: "No hay mensajes para exportar",
        variant: "destructive"
      });
      return;
    }

    const content = messages.map(msg => 
      `${msg.type === 'user' ? 'Usuario' : 'Asistente'} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n\n`
    ).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${currentConversation.title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversación exportada",
      description: "La conversación se ha descargado como archivo de texto"
    });
  };

  // Sidebar para historial y plantillas
  if (showHistory) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-gray-200 dark:border-gray-700">
          <ConversationHistory onClose={() => setShowHistory(false)} />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Selecciona una conversación para continuar
        </div>
      </div>
    );
  }

  if (showTemplates) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-gray-200 dark:border-gray-700">
          <PromptTemplates 
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplates(false)} 
          />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Selecciona una plantilla para usar
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Action Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>Historial</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="flex items-center space-x-2"
            >
              <File className="h-4 w-4" />
              <span>Plantillas</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4" role="main" aria-label="Conversación">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden">
              <img 
                src="https://www.skandia.com.mx/mercadeo/2021/campana/Sami/Mail/Sami/Thinking2.gif" 
                alt="Sami Logo" 
                className="w-full h-full object-contain animate-pulse"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¡Hola! ¿En qué puedo ayudarte hoy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
              Puedes hacerme preguntas, subir archivos para analizar, o pedirme que genere gráficas y tablas de datos.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                <File className="h-3 w-3 mr-1" />
                Ver Plantillas
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                <History className="h-3 w-3 mr-1" />
                Ver Historial
              </Button>
            </div>
          </div>
        )}

        {messages.map((message) => {
          console.log('ChatInterface: Rendering message:', message.id, message.type, message.content.substring(0, 50));
          return (
            <ChatMessage
              key={message.id}
              message={message}
              isSelected={selectedMessage?.id === message.id}
              onClick={() => onSelectMessage(message)}
            />
          );
        })}

        {isLoading && (
          <div className="flex justify-start animate-fade-in" role="status" aria-live="polite" aria-label="Procesando respuesta">
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
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 animate-fade-in" aria-label="Archivos seleccionados">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2 animate-scale-in"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                  className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
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
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading}
            initialValue={templateContent}
            onValueChange={setTemplateContent}
          />
        </div>
      </div>
    </div>
  );
};
