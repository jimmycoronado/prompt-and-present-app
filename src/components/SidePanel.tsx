
import { useState } from 'react';
import { PanelLeft, Search, MessageSquare, FileText, Edit3, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ConversationHistory } from './ConversationHistory';
import { PromptTemplates } from './PromptTemplates';
import { useConversation } from '../contexts/ConversationContext';
import { PromptTemplate } from '../types/templates';

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
  const [activeView, setActiveView] = useState<'main' | 'chats' | 'templates'>('main');
  const { createNewConversation } = useConversation();

  const handleNewChat = () => {
    createNewConversation();
    onNewChat();
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    // TODO: Implement template selection logic
    console.log('Selected template:', template);
    setActiveView('main');
  };

  const handleBackToMain = () => {
    setActiveView('main');
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <div className="fixed left-4 top-20 z-50 flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-10 w-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Abrir panel lateral"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir barra lateral</p>
            </TooltipContent>
          </Tooltip>
          
          {hasActiveConversation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewChat}
                  className="h-10 w-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  aria-label="Nuevo chat"
                >
                  <Edit3 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nuevo chat</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
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
              {/* Botón Nuevo Chat */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleNewChat}
                  className="w-full bg-skandia-green hover:bg-skandia-green/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo chat
                </Button>
              </div>

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
        </div>
      </div>
    </>
  );
};
