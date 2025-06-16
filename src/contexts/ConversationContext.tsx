import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { azureConversationService } from '../services/azureConversationService';
import { useAuth } from './AuthContext';

interface ConversationContextType {
  conversations: ConversationSummary[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  createNewConversation: () => Promise<string>;
  loadConversation: (id: string) => Promise<void>;
  saveConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  searchConversations: (query: string) => ConversationSummary[];
  addMessageToCurrentConversation: (message: ChatMessage) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  uploadFileToConversation: (file: File, conversationId: string) => Promise<string>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const userEmail = user?.email || '';

  useEffect(() => {
    if (userEmail) {
      console.log('🔍 ConversationContext: User email detected, loading conversations:', userEmail);
      loadConversations();
    } else {
      console.log('⚠️ ConversationContext: No user email, skipping conversation load');
    }
  }, [userEmail]);

  // Log currentConversation changes
  useEffect(() => {
    console.log('ConversationContext: currentConversation state changed:', currentConversation?.id, currentConversation?.messages?.length);
  }, [currentConversation]);

  const loadConversations = async () => {
    if (!userEmail) {
      console.log('⚠️ ConversationContext.loadConversations: No userEmail, returning');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🚀 ConversationContext.loadConversations: Starting to load conversations for user:', userEmail);
      
      const azureConversations = await azureConversationService.listUserConversations(userEmail);
      console.log('📋 ConversationContext.loadConversations: Raw Azure conversations received:', {
        count: azureConversations.length,
        conversations: azureConversations
      });

      if (azureConversations.length === 0) {
        console.log('📭 ConversationContext.loadConversations: No conversations found in Azure for user:', userEmail);
        setConversations([]);
        return;
      }

      console.log('🔄 ConversationContext.loadConversations: Converting Azure conversations to summaries...');
      const summaries = azureConversations.map((conv, index) => {
        console.log(`📝 ConversationContext.loadConversations: Converting conversation ${index + 1}/${azureConversations.length}:`, {
          id: conv.id,
          title: conv.title,
          messagesCount: conv.messages?.length || 0,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          tags: conv.tags
        });
        
        try {
          const summary = azureConversationService.convertToSummary(conv);
          console.log(`✅ ConversationContext.loadConversations: Successfully converted conversation ${conv.id} to summary:`, summary);
          return summary;
        } catch (error) {
          console.error(`❌ ConversationContext.loadConversations: Error converting conversation ${conv.id}:`, error);
          console.error('📊 ConversationContext.loadConversations: Problematic conversation data:', conv);
          throw error;
        }
      });

      console.log('🎉 ConversationContext.loadConversations: Successfully converted all conversations to summaries:', {
        count: summaries.length,
        summaries: summaries
      });

      setConversations(summaries);
      console.log('💾 ConversationContext.loadConversations: Conversations state updated with', summaries.length, 'summaries');
      
    } catch (error) {
      console.error('💥 ConversationContext.loadConversations: Error loading conversations:', error);
      console.error('🔍 ConversationContext.loadConversations: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setConversations([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 ConversationContext.loadConversations: Loading process completed');
    }
  };

  const createNewConversation = async (): Promise<string> => {
    if (!userEmail) throw new Error('User not authenticated');
    
    console.log('ConversationContext: Creating new conversation in Azure only');
    
    try {
      // Create conversation directly in Azure
      const azureConversationId = await azureConversationService.createConversation(userEmail, 'Nueva conversación');
      
      const newConversation: Conversation = {
        id: azureConversationId,
        title: 'Nueva conversación',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        isArchived: false,
        totalTokens: 0
      };

      console.log('ConversationContext: Setting new Azure conversation:', newConversation);
      setCurrentConversation(newConversation);
      
      // Reload conversations list from Azure
      await loadConversations();
      
      return azureConversationId;
    } catch (error) {
      console.error('Error creating conversation in Azure:', error);
      throw error;
    }
  };

  const loadConversation = async (id: string) => {
    if (!userEmail) return;
    
    setIsLoading(true);
    try {
      console.log('ConversationContext: Loading conversation from Azure only:', id);
      
      const azureConv = await azureConversationService.getConversation(id, userEmail);
      if (azureConv) {
        // Get conversation files
        const files = await azureConversationService.getConversationFiles(id, userEmail);
        const loadedConversation = azureConversationService.convertToInternalFormat(azureConv, files);
        setCurrentConversation(loadedConversation);
        console.log('ConversationContext: Loaded Azure conversation with messages:', loadedConversation.messages.length);
      } else {
        console.warn('ConversationContext: Conversation not found in Azure:', id);
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error loading conversation from Azure:', error);
      setCurrentConversation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    if (!userEmail) return;
    
    try {
      console.log('ConversationContext: Saving conversation to Azure only:', conversation.id);
      
      const azureFormat = azureConversationService.convertToAzureFormat(conversation);
      await azureConversationService.updateConversation(conversation.id, userEmail, azureFormat);
      
      console.log('ConversationContext: Conversation saved to Azure successfully');
      
      // Update the conversations list from Azure
      await loadConversations();
    } catch (error) {
      console.error('Error saving conversation to Azure:', error);
      throw error;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      console.log('ConversationContext: Deleting conversation from Azure:', id);
      
      // TODO: Implement delete endpoint in Azure backend
      // For now, just remove from local state and reload from Azure
      
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
      
      console.log('ConversationContext: Conversation removed from local state');
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const archiveConversation = async (id: string) => {
    if (!userEmail) return;
    
    try {
      console.log('ConversationContext: Archiving conversation in Azure:', id);
      
      // TODO: Implement archive endpoint in Azure backend
      // For now, reload conversations from Azure
      await loadConversations();
      
      console.log('ConversationContext: Conversation archived in Azure');
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const searchConversations = (query: string): ConversationSummary[] => {
    console.log('🔍 ConversationContext.searchConversations: Searching with query:', query);
    console.log('📋 ConversationContext.searchConversations: Available conversations to search:', {
      count: conversations.length,
      conversations: conversations.map(c => ({ id: c.id, title: c.title, lastMessage: c.lastMessage.substring(0, 50) }))
    });
    
    if (!query.trim()) {
      console.log('📤 ConversationContext.searchConversations: Empty query, returning all conversations:', conversations.length);
      return conversations;
    }
    
    const filtered = conversations.filter(conv => {
      const titleMatch = conv.title.toLowerCase().includes(query.toLowerCase());
      const messageMatch = conv.lastMessage.toLowerCase().includes(query.toLowerCase());
      const tagMatch = conv.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matches = titleMatch || messageMatch || tagMatch;
      
      if (matches) {
        console.log('✅ ConversationContext.searchConversations: Conversation matches query:', {
          id: conv.id,
          title: conv.title,
          titleMatch,
          messageMatch,
          tagMatch
        });
      }
      
      return matches;
    });
    
    console.log('📤 ConversationContext.searchConversations: Filtered results:', {
      query,
      originalCount: conversations.length,
      filteredCount: filtered.length,
      filtered: filtered.map(c => ({ id: c.id, title: c.title }))
    });
    
    return filtered;
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
      
      // Save conversation to Azure only (async, but don't block UI)
      saveConversation(updatedConversation).catch(error => {
        console.error('Error saving conversation to Azure:', error);
      });

      console.log('ConversationContext: END addMessageToCurrentConversation');
      return updatedConversation;
    });
  }, [userEmail]);

  const updateConversationTitle = async (id: string, title: string) => {
    if (!userEmail) return;
    
    try {
      console.log('ConversationContext: Updating conversation title in Azure:', id, title);
      
      const conversation = currentConversation;
      if (conversation && conversation.id === id) {
        const updatedConversation = { ...conversation, title, updatedAt: new Date() };
        await saveConversation(updatedConversation);
        setCurrentConversation(updatedConversation);
        console.log('ConversationContext: Conversation title updated in Azure');
      }
    } catch (error) {
      console.error('Error updating conversation title in Azure:', error);
    }
  };

  const uploadFileToConversation = async (file: File, conversationId: string): Promise<string> => {
    if (!userEmail) throw new Error('User not authenticated');
    
    try {
      console.log('ConversationContext: Uploading file to Azure:', file.name, conversationId);
      
      const fileName = await azureConversationService.uploadFile(file, userEmail, conversationId);
      console.log('ConversationContext: File uploaded to Azure successfully:', fileName);
      return fileName;
    } catch (error) {
      console.error('Error uploading file to Azure:', error);
      throw error;
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
      updateConversationTitle,
      uploadFileToConversation
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
