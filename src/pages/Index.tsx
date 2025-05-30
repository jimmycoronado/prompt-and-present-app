
import { useState } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { ThemeProvider } from "../contexts/ThemeContext";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
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
    </ThemeProvider>
  );
};

export default Index;
