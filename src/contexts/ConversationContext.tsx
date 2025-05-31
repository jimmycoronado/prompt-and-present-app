
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { useAuth } from './AuthContext';
import {
  saveConversation as saveConversationToAzure,
  updateConversation as updateConversationInAzure,
  getUserConversations,
  getConversation,
  deleteConversation as deleteConversationFromAzure,
  archiveConversation as archiveConversationInAzure
} from '../utils/azureDataService';

interface ConversationContextType {
  conversations: ConversationSummary[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  createNewConversation: () => string;
  loadConversation: (id: string) => Promise<void>;
  saveConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  searchConversations: (query: string) => ConversationSummary[];
  addMessageToCurrentConversation: (message: ChatMessage) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      loadConversations();
      restoreCurrentConversation();
    }
  }, [user?.email]);

  // Log currentConversation changes
  useEffect(() => {
    console.log('ConversationContext: currentConversation state changed:', currentConversation?.id, currentConversation?.messages?.length);
  }, [currentConversation]);

  // Save current conversation ID to localStorage whenever it changes
  useEffect(() => {
    if (currentConversation) {
      localStorage.setItem('ai-chat-current-conversation-id', currentConversation.id);
    } else {
      localStorage.removeItem('ai-chat-current-conversation-id');
    }
  }, [currentConversation?.id]);

  const restoreCurrentConversation = async () => {
    try {
      const currentId = localStorage.getItem('ai-chat-current-conversation-id');
      if (currentId && user?.email) {
        console.log('ConversationContext: Restoring conversation:', currentId);
        await loadConversation(currentId);
      }
    } catch (error) {
      console.error('Error restoring current conversation:', error);
    }
  };

  const loadConversations = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const userConversations = await getUserConversations(user.email);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversationToAzureAndUpdate = async (conversation: Conversation) => {
    if (!user?.email) return;
    
    try {
      console.log('ConversationContext: Saving conversation to Azure:', conversation.id, conversation.messages.length);
      
      // Check if conversation exists
      const existingConv = conversations.find(c => c.id === conversation.id);
      
      if (existingConv) {
        await updateConversationInAzure(user.email, conversation);
      } else {
        await saveConversationToAzure(user.email, conversation);
      }
      
      // Update local summary
      const summary: ConversationSummary = {
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation.messages.length,
        lastMessage: conversation.messages[conversation.messages.length - 1]?.content || '',
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        tags: conversation.tags
      };

      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conversation.id);
        return [summary, ...filtered];
      });
    } catch (error) {
      console.error('Error saving conversation to Azure:', error);
    }
  };

  const createNewConversation = (): string => {
    console.log('ConversationContext: Creating new conversation');
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      isArchived: false,
      totalTokens: 0
    };

    console.log('ConversationContext: Setting new conversation:', newConversation);
    setCurrentConversation(newConversation);
    
    return newId;
  };

  const loadConversation = async (id: string) => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const loadedConversation = await getConversation(user.email, id);
      if (loadedConversation) {
        setCurrentConversation(loadedConversation);
        console.log('ConversationContext: Loaded conversation with messages:', loadedConversation.messages.length);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    return saveConversationToAzureAndUpdate(conversation);
  };

  const deleteConversation = async (id: string) => {
    if (!user?.email) return;
    
    try {
      await deleteConversationFromAzure(user.email, id);
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const archiveConversation = async (id: string) => {
    if (!user?.email) return;
    
    try {
      await archiveConversationInAzure(user.email, id);
      await loadConversations(); // Reload conversations to reflect changes
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const searchConversations = (query: string): ConversationSummary[] => {
    if (!query.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(query.toLowerCase()) ||
      conv.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const addMessageToCurrentConversation = useCallback((message: ChatMessage) => {
    console.log('ConversationContext: START addMessageToCurrentConversation with message:', message.id, message.type, message.content.substring(0, 50));
    
    setCurrentConversation(prevConversation => {
      if (!prevConversation) {
        console.warn('ConversationContext: No current conversation to add message to');
        return prevConversation;
      }

      console.log('ConversationContext: Current conversation before update:', prevConversation.id, prevConversation.messages.length);

      // Create updated conversation with new message
      const updatedConversation = {
        ...prevConversation,
        messages: [...prevConversation.messages, message],
        updatedAt: new Date(),
        title: prevConversation.messages.length === 0 ? 
          message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '') : 
          prevConversation.title
      };

      console.log('ConversationContext: Updated conversation created:', updatedConversation.id, updatedConversation.messages.length);
      console.log('ConversationContext: All messages in updated conversation:', updatedConversation.messages.map(m => `${m.id}:${m.type}:${m.content.substring(0, 20)}`));
      
      // Save to Azure immediately
      console.log('ConversationContext: Executing save to Azure...');
      saveConversationToAzureAndUpdate(updatedConversation);

      console.log('ConversationContext: END addMessageToCurrentConversation');
      return updatedConversation;
    });
  }, [user?.email]);

  const updateConversationTitle = async (id: string, title: string) => {
    if (!user?.email) return;
    
    try {
      const conversation = await getConversation(user.email, id);
      if (conversation) {
        const updatedConversation = {
          ...conversation,
          title,
          updatedAt: new Date()
        };
        await saveConversation(updatedConversation);
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  return (
    <ConversationContext.Provider value={{
      conversations,
      currentConversation,
      isLoading,
      createNewConversation,
      loadConversation,
      saveConversation,
      deleteConversation,
      archiveConversation,
      searchConversations,
      addMessageToCurrentConversation,
      updateConversationTitle
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
