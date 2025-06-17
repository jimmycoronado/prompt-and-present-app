
import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { ChatInterface, ChatInterfaceRef } from '@/components/ChatInterface';
import { SidePanel } from '@/components/SidePanel';
import { useConversation } from '@/contexts/ConversationContext';
import { ChatMessage } from '@/types/chat';
import { DynamicBanner } from '@/components/DynamicBanner';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Index() {
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);
  const isMobile = useIsMobile();
  
  const { currentConversation, startNewConversation } = useConversation();

  const handleToggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const handleNewChat = () => {
    startNewConversation();
    setSelectedMessage(null);
    
    // Close side panel on mobile after starting new chat
    if (isMobile) {
      setIsSidePanelOpen(false);
    }
  };

  const handleBannerAction = (message: string) => {
    console.log('Index: Banner action triggered with message:', message);
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleBannerMessage(message);
    }
  };

  const handleSelectTemplate = (content: string) => {
    console.log('Index: Template selected, passing to ChatInterface:', content);
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleBannerMessage(content);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header 
        onToggleSidebar={handleToggleSidePanel}
        onBannerAction={handleBannerAction}
      />
      
      <DynamicBanner onClose={() => {}} onBannerAction={handleBannerAction} />
      
      <div className="flex-1 flex relative">
        <SidePanel 
          isOpen={isSidePanelOpen}
          onToggle={handleToggleSidePanel}
          onNewChat={handleNewChat}
          hasActiveConversation={!!currentConversation?.messages?.length}
          onSelectTemplate={handleSelectTemplate}
        />
        
        <div className={`flex-1 transition-all duration-300 ${
          isSidePanelOpen && !isMobile ? 'ml-80' : 'ml-0'
        }`}>
          <ChatInterface 
            ref={chatInterfaceRef}
            onSelectMessage={setSelectedMessage}
            selectedMessage={selectedMessage}
          />
        </div>
      </div>
    </div>
  );
}
