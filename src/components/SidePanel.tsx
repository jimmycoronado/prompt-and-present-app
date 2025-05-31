
import { useState } from 'react';
import { PanelLeft, Search, MessageSquare, FileText, Edit3, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ConversationHistory } from './ConversationHistory';
import { PromptTemplates } from './PromptTemplates';
import { useConversation } from '../contexts/ConversationContext';

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
  const [activeTab, setActiveTab] = useState<'chats' | 'templates'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const { createNewConversation } = useConversation();

  const handleNewChat = () => {
    createNewConversation();
    onNewChat();
  };

  if (!isOpen) {
    return (
      <div className="fixed left-4 top-20 z-50 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-10 w-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Abrir panel lateral"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        
        {hasActiveConversation && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className="h-10 w-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Nuevo chat"
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
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

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

        {/* Tabs para Chats y Plantillas */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'chats'
                ? 'text-skandia-green border-b-2 border-skandia-green bg-green-50 dark:bg-green-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Search className="h-4 w-4" />
            Buscar chats
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-skandia-green border-b-2 border-skandia-green bg-green-50 dark:bg-green-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Plantillas
          </button>
        </div>

        {/* Contenido del tab activo */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' ? (
            <ConversationHistory onClose={() => {}} />
          ) : (
            <div className="h-full">
              <PromptTemplates />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
