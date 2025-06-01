import { useState, useRef } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { Sidebar } from "../components/Sidebar";
import { SidePanel } from "../components/SidePanel";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConversationProvider, useConversation } from "../contexts/ConversationContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useIsMobile } from "../hooks/use-mobile";

const IndexContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { currentConversation, isLoading } = useConversation();
  const isMobile = useIsMobile();
  
  // Ref para acceder a las funciones del ChatInterface
  const chatInterfaceRef = useRef<any>(null);

  const hasActiveConversation = currentConversation !== null;

  const handleNewChat = () => {
    setSidePanelOpen(false);
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
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.jpg" 
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
    <div className={`${isMobile ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col`}>
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        onToggleSidePanel={() => setSidePanelOpen(!sidePanelOpen)}
        onBannerAction={handleBannerAction}
      />
      
      <SidePanel 
        isOpen={sidePanelOpen}
        onToggle={() => setSidePanelOpen(!sidePanelOpen)}
        onNewChat={handleNewChat}
        hasActiveConversation={hasActiveConversation}
      />
      
      <div className={`flex flex-1 ${isMobile ? 'min-h-0 overflow-hidden' : 'overflow-hidden min-h-0'}`}>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ChatInterface 
            ref={chatInterfaceRef}
            onSelectMessage={setSelectedMessage}
            selectedMessage={selectedMessage}
          />
        </div>
        
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedMessage={selectedMessage}
        />
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
