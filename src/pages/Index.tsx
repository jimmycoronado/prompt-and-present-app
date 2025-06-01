import { useState } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { Sidebar } from "../components/Sidebar";
import { SidePanel } from "../components/SidePanel";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConversationProvider, useConversation } from "../contexts/ConversationContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ProtectedRoute } from "../components/ProtectedRoute";

const IndexContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { currentConversation, isLoading } = useConversation();

  const hasActiveConversation = currentConversation !== null;

  const handleNewChat = () => {
    setSidePanelOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden border border-gray-200">
            <img 
              src="https://www.skandia.com.mx/mercadeo/2021/campana/Sami/Mail/Sami/Thinking2.gif" 
              alt="Sami Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Restaurando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <SidePanel 
        isOpen={sidePanelOpen}
        onToggle={() => setSidePanelOpen(!sidePanelOpen)}
        onNewChat={handleNewChat}
        hasActiveConversation={hasActiveConversation}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col">
          <ChatInterface 
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
