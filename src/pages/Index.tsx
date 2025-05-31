
import { useState } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { Sidebar } from "../components/Sidebar";
import { SidePanel } from "../components/SidePanel";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConversationProvider, useConversation } from "../contexts/ConversationContext";
import { SettingsProvider } from "../contexts/SettingsContext";

const IndexContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { currentConversation } = useConversation();

  const hasActiveConversation = currentConversation !== null;

  const handleNewChat = () => {
    // Cerrar el panel lateral después de crear un nuevo chat
    setSidePanelOpen(false);
  };

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
    <ThemeProvider>
      <SettingsProvider>
        <ConversationProvider>
          <IndexContent />
        </ConversationProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default Index;
