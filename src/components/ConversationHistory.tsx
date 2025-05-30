import { useState } from 'react';
import { Search, MessageSquare, Archive, Trash2, Edit3, Calendar, Tag } from 'lucide-react';
import { useConversation } from '../contexts/ConversationContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationHistoryProps {
  onClose: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    conversations, 
    loadConversation, 
    deleteConversation, 
    archiveConversation,
    searchConversations,
    createNewConversation 
  } = useConversation();

  const filteredConversations = searchConversations(searchQuery);

  const handleLoadConversation = async (id: string) => {
    await loadConversation(id);
    onClose();
  };

  const handleNewConversation = () => {
    createNewConversation();
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Historial de Conversaciones
          </h2>
          <Button
            onClick={handleNewConversation}
            size="sm"
            className="bg-skandia-green hover:bg-skandia-green/90 text-white w-full"
          >
            Nueva Conversación
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones guardadas'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleLoadConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(conversation.updatedAt, { addSuffix: true, locale: es })}
                      </span>
                      <span>{conversation.messageCount} mensajes</span>
                    </div>

                    {conversation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {conversation.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{conversation.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implementar edición de título
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveConversation(conversation.id);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
                          deleteConversation(conversation.id);
                        }
                      }}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
