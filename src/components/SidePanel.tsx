import { useState, useEffect } from 'react';
import { PanelLeft, Search, MessageSquare, FileText, Edit3, Plus, X, User } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { ConversationHistory } from './ConversationHistory';
import { PromptTemplates } from './PromptTemplates';
import { PersonalityManager } from './PersonalityManager';
import { useConversation } from '../contexts/ConversationContext';
import { PromptTemplate } from '../types/templates';
import { Personality } from '../types/personalities';
import { useIsMobile } from '../hooks/use-mobile';

interface SidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  hasActiveConversation: boolean;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat,
  hasActiveConversation 
}) => {
  const [activeView, setActiveView] = useState<'main' | 'chats' | 'templates' | 'personalities'>('main');
  const { startNewConversation } = useConversation();
  const isMobile = useIsMobile();

  // Touch gesture states
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;
      
      const touch = e.touches[0];
      setTouchMove({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || !touchMove) {
        setTouchStart(null);
        setTouchMove(null);
        return;
      }

      const deltaX = touchMove.x - touchStart.x;
      const deltaY = Math.abs(touchMove.y - touchStart.y);
      const minSwipeDistance = 50;
      const edgeThreshold = 20; // Pixels from the edge to trigger swipe

      // Check if the swipe is more horizontal than vertical
      if (deltaY < 100) {
        // Opening gesture: swipe right from left edge
        if (!isOpen && touchStart.x <= edgeThreshold && deltaX > minSwipeDistance) {
          onToggle();
        }
        // Closing gesture: swipe left when sidebar is open
        else if (isOpen && deltaX < -minSwipeDistance) {
          onToggle();
        }
      }

      setTouchStart(null);
      setTouchMove(null);
    };

    // Add touch event listeners to the document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isOpen, onToggle, touchStart, touchMove]);

  const handleNewChat = () => {
    startNewConversation(); // This only clears the UI, no Azure call
    onNewChat();
  };

  const handleSelectTemplate = (content: string) => {
    console.log('SidePanel: Template content selected:', content);
    setActiveView('main');
  };

  const handleSelectPersonality = (personality: Personality) => {
    // TODO: Implement personality selection logic
    console.log('Selected personality:', personality);
    setActiveView('main');
  };

  const handleBackToMain = () => {
    setActiveView('main');
  };

  if (!isOpen) {
    return (
      <div className="fixed left-4 top-20 z-50 flex flex-col gap-2">
        {/* Botón de panel lateral - solo en desktop */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-10 w-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
            aria-label="Abrir panel lateral"
            title="Abrir barra lateral"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        
        {/* Solo mostrar botón de nuevo chat en desktop cuando no esté en móvil */}
        {hasActiveConversation && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className="h-10 w-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
            aria-label="Nuevo chat"
            title="Nuevo chat"
          >
            <Edit3 className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Overlay para móvil */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onToggle}
      />
      
      {/* Panel lateral */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50 flex flex-col">
        {/* Header del panel */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Chat</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'main' && (
            <div className="flex flex-col h-full">
              {/* Botón Nuevo Chat - solo en desktop */}
              {!isMobile && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleNewChat}
                    className="w-full bg-skandia-green hover:bg-skandia-green/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo chat
                  </Button>
                </div>
              )}

              {/* Opciones principales */}
              <div className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setActiveView('chats')}
                  className="w-full justify-start h-12"
                >
                  <Search className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Buscar chats</div>
                    <div className="text-xs text-gray-500">Encuentra conversaciones anteriores</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setActiveView('templates')}
                  className="w-full justify-start h-12"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Plantillas</div>
                    <div className="text-xs text-gray-500">Prompts predefinidos</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setActiveView('personalities')}
                  className="w-full justify-start h-12"
                >
                  <User className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Personalidades</div>
                    <div className="text-xs text-gray-500">Agentes personalizados</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {activeView === 'chats' && (
            <div className="h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Historial de chats</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToMain}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ConversationHistory onClose={handleBackToMain} />
            </div>
          )}

          {activeView === 'templates' && (
            <div className="h-full">
              <PromptTemplates 
                onSelectTemplate={handleSelectTemplate}
                onClose={handleBackToMain}
              />
            </div>
          )}

          {activeView === 'personalities' && (
            <div className="h-full">
              <PersonalityManager 
                onSelectPersonality={handleSelectPersonality}
                onClose={handleBackToMain}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
