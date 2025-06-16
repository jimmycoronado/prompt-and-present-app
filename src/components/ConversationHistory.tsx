
import { useState, useEffect } from 'react';
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
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const { 
    conversations, 
    loadConversation, 
    deleteConversation, 
    archiveConversation,
    searchConversations,
    isLoading,
    currentConversation
  } = useConversation();

  // Log conversations data when component mounts and when conversations change
  useEffect(() => {
    console.log('🏛️ ConversationHistory: Component mounted/conversations changed');
    console.log('📊 ConversationHistory: Conversations data:', {
      count: conversations.length,
      isLoading,
      conversations: conversations.map(c => ({
        id: c.id,
        title: c.title,
        messageCount: c.messageCount,
        lastMessage: c.lastMessage.substring(0, 50),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        tags: c.tags
      }))
    });
  }, [conversations, isLoading]);

  const filteredConversations = searchConversations(searchQuery);

  // Log filtered results
  useEffect(() => {
    console.log('🔍 ConversationHistory: Search results updated:', {
      searchQuery,
      originalCount: conversations.length,
      filteredCount: filteredConversations.length,
      filteredConversations: filteredConversations.map(c => ({
        id: c.id,
        title: c.title
      }))
    });
  }, [searchQuery, filteredConversations, conversations.length]);

  const handleLoadConversation = async (id: string) => {
    console.log('📂 ConversationHistory: STARTING handleLoadConversation for ID:', id);
    
    try {
      setLoadingConversationId(id);
      console.log('📂 ConversationHistory: Set loading state for conversation:', id);
      
      console.log('📂 ConversationHistory: Calling loadConversation...');
      await loadConversation(id);
      console.log('📂 ConversationHistory: loadConversation completed successfully');
      
      // Wait a bit to ensure the conversation is loaded before closing
      setTimeout(() => {
        console.log('📂 ConversationHistory: Closing conversation history after delay');
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('💥 ConversationHistory: Error loading conversation:', error);
    } finally {
      setLoadingConversationId(null);
      console.log('📂 ConversationHistory: Cleared loading state');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    console.log('🔍 ConversationHistory: Search query changed:', newQuery);
    setSearchQuery(newQuery);
  };

  // Log when currentConversation changes
  useEffect(() => {
    console.log('📂 ConversationHistory: currentConversation changed:', {
      id: currentConversation?.id,
      title: currentConversation?.title,
      messageCount: currentConversation?.messages?.length
    });
  }, [currentConversation]);

  return (
    <div className="flex flex-col h-full">
      {/* Buscador */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          Debug: {conversations.length} conversaciones cargadas, {filteredConversations.length} filtradas
          {isLoading && " (Cargando...)"}
          {loadingConversationId && ` (Cargando conversación: ${loadingConversationId})`}
        </div>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? (
                <>
                  <p>No se encontraron conversaciones para "{searchQuery}"</p>
                  <p className="text-xs mt-2">Total disponibles: {conversations.length}</p>
                </>
              ) : (
                <>
                  <p>No hay conversaciones guardadas</p>
                  <p className="text-xs mt-2">Verificando Azure API...</p>
                </>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  loadingConversationId === conversation.id ? 'opacity-50' : ''
                } ${
                  currentConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                }`}
                onClick={() => handleLoadConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.title}
                      </h3>
                      {loadingConversationId === conversation.id && (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      )}
                      {currentConversation?.id === conversation.id && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
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
