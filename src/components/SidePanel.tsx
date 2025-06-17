
import React, { useState, useEffect } from "react";
import { ConversationHistory } from "./ConversationHistory";
import { PromptTemplates } from "./PromptTemplates";
import { SettingsModal } from "./SettingsModal";
import { NotificationPanel } from "./NotificationPanel";
import { UserMenu } from "./UserMenu";
import { Button } from "./ui/button";
import { 
  MessageCircle, 
  History, 
  FileText, 
  Settings, 
  Bell,
  X,
  Menu
} from "lucide-react";
import { useConversation } from "../contexts/ConversationContext";
import { useIsMobile } from "../hooks/use-mobile";
import { PromptTemplate } from "../types/templates";

interface SidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  hasActiveConversation: boolean;
  onConversationLoading?: (loading: boolean) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  hasActiveConversation,
  onConversationLoading 
}) => {
  const [activeView, setActiveView] = useState<'main' | 'history' | 'templates' | 'settings' | 'notifications'>('main');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { startNewConversation, loadConversation } = useConversation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen) {
      // Reset active view when the sidebar is closed
      setActiveView('main');
    }
  }, [isOpen]);

  const renderView = () => {
    switch (activeView) {
      case 'history':
        return <ConversationHistory onClose={() => setActiveView('main')} onSelectConversation={handleSelectConversation} />;
      case 'templates':
        return <PromptTemplates onClose={() => setActiveView('main')} onSelectTemplate={handleSelectTemplate} />;
      case 'settings':
        return <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />;
      case 'notifications':
        return <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />;
      default:
        return null;
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    console.log('SidePanel: Template selected:', template.content);
    setActiveView('main');
    if (isMobile) {
      onToggle();
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    console.log('SidePanel: Loading conversation:', conversationId);
    setActiveView('main');
    
    // Notify parent that we're loading a conversation
    onConversationLoading?.(true);
    
    try {
      await loadConversation(conversationId);
    } finally {
      onConversationLoading?.(false);
    }
    
    if (isMobile) {
      onToggle();
    }
  };

  const handleNewChat = () => {
    console.log('SidePanel: Starting new chat');
    startNewConversation();
    setActiveView('main');
    onNewChat();
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? 'block' : 'hidden'}`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-gray-50 dark:bg-gray-900 shadow-xl">
                  <div className="bg-gray-100 dark:bg-gray-800 py-2">
                    <div className="px-4 flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Menú
                      </h2>
                      <Button variant="ghost" size="icon" onClick={onToggle}>
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <nav className="flex-1 space-y-1 bg-white dark:bg-gray-800 px-2" aria-label="Sidebar">
                      <Button
                        variant="ghost"
                        className="w-full justify-start dark:hover:bg-gray-700"
                        onClick={handleNewChat}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Nuevo chat
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start dark:hover:bg-gray-700"
                        onClick={() => setActiveView('history')}
                      >
                        <History className="mr-2 h-4 w-4" />
                        Historial
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start dark:hover:bg-gray-700"
                        onClick={() => setActiveView('templates')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Plantillas
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start dark:hover:bg-gray-700"
                        onClick={() => {
                          setShowSettings(true);
                          setActiveView('settings');
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start dark:hover:bg-gray-700"
                        onClick={() => {
                          setShowNotifications(true);
                          setActiveView('notifications');
                        }}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Notificaciones
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 w-72 ${isOpen ? 'block' : 'hidden lg:block'}`}
        >
          <div className="bg-gray-100 dark:bg-gray-800 py-2">
            <div className="px-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Menú
              </h2>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <nav className="flex-1 space-y-1 bg-white dark:bg-gray-800 px-2" aria-label="Sidebar">
              <Button
                variant="ghost"
                className="w-full justify-start dark:hover:bg-gray-700"
                onClick={handleNewChat}
                disabled={!hasActiveConversation}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Nuevo chat
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start dark:hover:bg-gray-700"
                onClick={() => setActiveView('history')}
              >
                <History className="mr-2 h-4 w-4" />
                Historial
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start dark:hover:bg-gray-700"
                onClick={() => setActiveView('templates')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Plantillas
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start dark:hover:bg-gray-700"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start dark:hover:bg-gray-700"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notificaciones
              </Button>
            </nav>
          </div>
          <div className="p-4">
            <UserMenu />
          </div>
        </div>
      )}

      {/* Overlay content */}
      {(!isMobile || (isMobile && activeView !== 'main')) && (
        <div className={`fixed inset-0 z-40 bg-black bg-opacity-50 ${isOpen ? 'block' : 'hidden'}`} onClick={isMobile ? onToggle : undefined}></div>
      )}
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
            <div className="pointer-events-auto w-screen max-w-md">
              <div className="flex h-full flex-col overflow-y-scroll bg-gray-50 dark:bg-gray-900 shadow-xl">
                {renderView()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
