import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { File, Download } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ConversationHistory } from "./ConversationHistory";
import { PromptTemplates } from "./PromptTemplates";
import { callAzureAgentApi } from "../utils/azureApiService";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { PromptTemplate } from "../types/templates";
import { useConversation } from "../contexts/ConversationContext";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInterfaceProps {
  onSelectMessage: (message: ChatMessageType | null) => void;
  selectedMessage: ChatMessageType | null;
}

export interface ChatInterfaceRef {
  handleBannerMessage: (message: string) => void;
}

export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ 
  onSelectMessage, 
  selectedMessage 
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Get user email and access token from auth context
  const { user, accessToken } = useAuth();
  const userEmail = user?.email || "usuario@dominio.com";

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

  // File validation helper
  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files) return;
    
    console.log('ChatInterface: Processing', files.length, 'files');
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      console.log('ChatInterface: File validation:', file.name, 'type:', file.type, 'valid type:', isValidType, 'valid size:', isValidSize);
      
      return isValidType && isValidSize;
    });
    
    console.log('ChatInterface: Valid files after filtering:', validFiles.length);
    
    if (validFiles.length > 0) {
      console.log('ChatInterface: Adding', validFiles.length, 'files to uploaded files');
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Archivos agregados",
        description: `Se agregaron ${validFiles.length} archivo(s) para enviar`
      });
    } else if (files.length > 0) {
      toast({
        title: "Archivos no válidos",
        description: "Solo se permiten archivos PDF, imágenes, Excel y CSV (máximo 10MB)",
        variant: "destructive"
      });
    }
  };

  // Global drag and drop handlers (without paste)
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('ChatInterface: Global drag over');
      if (!isLoading) {
        setIsDragOver(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only hide drag state if leaving the entire window
      if (!e.relatedTarget || (e.relatedTarget as Element).nodeName === 'HTML') {
        console.log('ChatInterface: Global drag leave');
        setIsDragOver(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('ChatInterface: Global drop event, files:', e.dataTransfer?.files.length);
      setIsDragOver(false);
      
      if (!isLoading && e.dataTransfer?.files) {
        validateAndProcessFiles(e.dataTransfer.files);
      }
    };

    // Add event listeners (removed paste handler)
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [isLoading, toast]);

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
    console.log('ChatInterface: Using authenticated user email for Azure API:', userEmail);
    console.log('ChatInterface: Using access token for Azure API:', !!accessToken);

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
      console.log('ChatInterface: Calling Azure API with authenticated user email and access token:', userEmail, !!accessToken);
      const response = await callAzureAgentApi(content, uploadedFiles, aiSettings, userEmail, accessToken);
      console.log('ChatInterface: Received Azure API response:', response);
      
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.text || '',
        timestamp: new Date(),
        data: response.data,
        chart: response.chart,
        downloadLink: response.downloadLink,
        videoPreview: response.videoPreview,
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
      console.error('ChatInterface: Error in Azure API call:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al conectar con el agente. Por favor, inténtalo de nuevo.',
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

  const handleFilesSelected = (files: File[]) => {
    console.log('ChatInterface: Files selected:', files.length);
    setUploadedFiles(prev => [...prev, ...files]);
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

  const handleBannerMessage = (content: string) => {
    console.log('ChatInterface: handleBannerMessage called with:', content);
    handleSendMessage(content);
  };

  // Expose the function to parent components
  useImperativeHandle(ref, () => ({
    handleBannerMessage
  }));

  return (
    <div 
      ref={mainContainerRef}
      className={`flex flex-col ${isMobile ? 'h-full max-h-full overflow-hidden' : 'h-full'} relative ${
        isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {/* Global Drag Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-blue-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border-2 border-dashed border-blue-400">
            <div className="text-center">
              <File className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Suelta los archivos aquí
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                PDF, imágenes, Excel o CSV (máximo 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <main 
        className={`flex-1 ${isMobile ? 'overflow-y-auto max-h-full pb-4' : 'overflow-y-auto'} p-4 space-y-4`} 
        role="main" 
        aria-label="Conversación"
        style={isMobile ? { paddingBottom: '140px' } : {}}
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-white p-2 overflow-hidden border border-gray-200">
              <img 
                src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.jpg" 
                alt="Dali AI Logo" 
                className="w-full h-full object-contain animate-pulse"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¡Hola! ¿En qué puedo ayudarte hoy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
              Puedes hacerme preguntas, subir archivos para analizar, o pedirme que genere gráficas y tablas de datos.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto">
              Arrastra archivos a cualquier parte de la pantalla o usa Ctrl+V para pegar
            </p>
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
                <span className="text-gray-500 dark:text-gray-400 text-sm">Consultando agente...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area Container - Fixed at bottom on mobile */}
      <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-40 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700' : 'flex-shrink-0 border-t border-gray-200 dark:border-gray-700'}`}>
        {/* File Upload Area */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 pb-2 animate-fade-in" aria-label="Archivos seleccionados">
            <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2 animate-scale-in"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                    className="text-orange-500 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded transition-colors"
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
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading}
              initialValue={templateContent}
              onValueChange={setTemplateContent}
              onFilesSelected={handleFilesSelected}
              uploadedFiles={uploadedFiles}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';
