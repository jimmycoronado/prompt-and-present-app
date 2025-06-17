
import { useState, useRef } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { SidePanel } from "../components/SidePanel";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConversationProvider, useConversation } from "../contexts/ConversationContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useIsMobile } from "../hooks/use-mobile";

const IndexContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentConversation, isLoading } = useConversation();
  const isMobile = useIsMobile();
  
  // Ref para acceder a las funciones del ChatInterface
  const chatInterfaceRef = useRef<any>(null);

  const hasActiveConversation = currentConversation !== null;

  const handleNewChat = () => {
    // Function called from SidePanel when new chat is initiated
    // The actual conversation clearing is handled by startNewConversation in SidePanel
  };

  const handleBannerAction = (automaticReply: string) => {
    console.log('Banner action received in Index:', automaticReply);
    // Acceder a la función de envío de mensaje del ChatInterface
    if (chatInterfaceRef.current?.handleBannerMessage) {
      chatInterfaceRef.current.handleBannerMessage(automaticReply);
    }
  };

  if (isLoading) {
    return (
      <div className={`${isMobile ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden border border-gray-200">
            <img 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif" 
              alt="Dali AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Restaurando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'h-[100dvh] overflow-hidden' : 'h-screen'} bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col`}>
      {/* Header fijo */}
      <div className="flex-shrink-0">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onBannerAction={handleBannerAction}
        />
      </div>
      
      <SidePanel 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        hasActiveConversation={hasActiveConversation}
      />
      
      {/* Contenido principal con altura calculada */}
      <div className={`flex flex-1 ${isMobile ? 'min-h-0 overflow-hidden' : 'overflow-hidden'}`} style={!isMobile ? { height: 'calc(100vh - 80px)' } : {}}>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ChatInterface 
            ref={chatInterfaceRef}
            onSelectMessage={() => {}}
            selectedMessage={null}
          />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ProtectedRoute>
      <ThemeProvider>
        <SettingsProvider>
          <ConversationProvider>
            <IndexContent />
          </ConversationProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default Index;
