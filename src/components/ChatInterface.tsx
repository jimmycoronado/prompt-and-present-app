import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { ConversationHistory } from "./ConversationHistory";
import { PromptTemplates } from "./PromptTemplates";
import { VoiceMode } from "./VoiceMode";
import { callAzureAgentApi } from "../utils/azureApiService";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { PromptTemplate } from "../types/templates";
import { useConversation } from "../contexts/ConversationContext";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DragOverlay } from "./chat/DragOverlay";
import { MessagesContainer } from "./chat/MessagesContainer";
import { InputContainer } from "./chat/InputContainer";

interface ChatInterfaceProps {
  onSelectMessage: (message: ChatMessageType | null) => void;
  selectedMessage: ChatMessageType | null;
}

export interface ChatInterfaceRef {
  handleBannerMessage: (message: string) => void;
}

// Default templates for the carousel if no user templates exist
const defaultCarouselTemplates: PromptTemplate[] = [
  {
    id: 'carousel-1',
    name: 'Incremento de Salarios',
    description: 'Analiza y explica conjuntos de datos con insights detallados',
    content: 'Selecciona mis clientes con incremento en su salario de por lo menos el 20% en el periodo actual VS el periodo 12 meses atrás. El salario actual debe ser mayor a 7 millones. Incluye los campos nombres, apellidos, teléfonos, correos, salario actual y el del periodo comparado. Dame un top 20 organizando por mayor salario actual',
    category: 'data',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'carousel-2',
    name: 'Comisiones por Cliente',
    description: 'Compara diferentes alternativas de manera estructurada',
    content: 'Dame los nombres, apellidos, teléfonos y correos del top 30 de mis clientes que me generaron más comisiones en los últimos 12 meses.',
    category: 'analysis',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'carousel-3',
    name: 'Resumen Ejecutivo',
    description: 'Crea resúmenes ejecutivos profesionales',
    content: 'Crea un resumen ejecutivo que incluya los puntos clave (3-5), recomendaciones principales, próximos pasos sugeridos y una conclusión clara.',
    category: 'writing',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'carousel-4',
    name: 'Plan Paso a Paso',
    description: 'Desarrolla planes detallados y estructurados',
    content: 'Crea un plan paso a paso detallado que incluya pasos específicos y ordenados, tiempo estimado para cada paso, recursos necesarios y posibles obstáculos con sus soluciones.',
    category: 'business',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  }
];

export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ 
  onSelectMessage, 
  selectedMessage 
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  // Load user templates from localStorage
  useEffect(() => {
    const loadUserTemplates = () => {
      try {
        console.log('ChatInterface: Loading user templates from localStorage');
        const savedTemplates = localStorage.getItem('promptTemplates');
        console.log('ChatInterface: Raw saved templates:', savedTemplates);
        
        if (savedTemplates) {
          const templates: PromptTemplate[] = JSON.parse(savedTemplates);
          console.log('ChatInterface: Parsed templates:', templates.length, templates);
          setUserTemplates(templates);
        } else {
          console.log('ChatInterface: No saved templates found, will show default templates');
          setUserTemplates([]);
        }
      } catch (error) {
        console.error('ChatInterface: Error loading user templates:', error);
        setUserTemplates([]);
      }
    };

    loadUserTemplates();
    
    // Listen for template changes
    const handleStorageChange = () => {
      console.log('ChatInterface: Storage change detected, reloading templates');
      loadUserTemplates();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Log when userTemplates changes
  useEffect(() => {
    console.log('ChatInterface: userTemplates state updated:', userTemplates.length, userTemplates);
  }, [userTemplates]);

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

  // Global drag and drop handlers
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

    // Add event listeners
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [isLoading, toast]);

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

  const handleVoiceMessage = (message: ChatMessageType) => {
    console.log('ChatInterface: Voice message received:', message);
    
    // Create new conversation if none exists
    if (!currentConversation) {
      createNewConversation();
    }
    
    // Add message to conversation
    addMessageToCurrentConversation(message);
  };

  const handleVoiceModeClick = () => {
    console.log('ChatInterface: Voice mode clicked');
    setShowVoiceMode(true);
  };

  const handleVoiceModeClose = () => {
    console.log('ChatInterface: Voice mode closed');
    setShowVoiceMode(false);
  };

  const handleVoiceError = (error: string) => {
    console.error('ChatInterface: Voice error:', error);
    toast({
      title: "Error en modo de voz",
      description: error,
      variant: "destructive"
    });
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    console.log('ChatInterface: Template selected:', template.content);
    setTemplateContent(template.content);
    setShowTemplates(false);
  };

  const handleCarouselTemplateSelect = (content: string) => {
    console.log('ChatInterface: Carousel template selected:', content);
    setTemplateContent(content);
  };

  const handleFilesSelected = (files: File[]) => {
    console.log('ChatInterface: Files selected:', files.length);
    setUploadedFiles(prev => [...prev, ...files]);
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

  // Get templates to show in carousel - prefer user templates, fallback to defaults
  const templatesToShow = userTemplates.length > 0 ? userTemplates : defaultCarouselTemplates;
  console.log('ChatInterface: Templates to show in carousel:', templatesToShow.length, templatesToShow.map(t => t.name));

  // Expose the function to parent components
  useImperativeHandle(ref, () => ({
    handleBannerMessage
  }));

  return (
    <div 
      ref={mainContainerRef}
      className={`flex flex-col h-full relative ${
        isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <DragOverlay isDragOver={isDragOver} />
      
      <MessagesContainer
        messages={messages}
        selectedMessage={selectedMessage}
        onSelectMessage={onSelectMessage}
        isLoading={isLoading}
        templates={templatesToShow}
        onSelectTemplate={handleCarouselTemplateSelect}
      />

      <InputContainer
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        templateContent={templateContent}
        onTemplateContentChange={setTemplateContent}
        onFilesSelected={handleFilesSelected}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onVoiceModeClick={handleVoiceModeClick}
      />

      {/* Voice Mode Overlay */}
      {showVoiceMode && (
        <VoiceMode
          onClose={handleVoiceModeClose}
          onMessage={handleVoiceMessage}
          onError={handleVoiceError}
        />
      )}
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';
