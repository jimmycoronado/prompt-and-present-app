
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
      loadConversations();
    }
  }, [userEmail]);

  // Log currentConversation changes
  useEffect(() => {
    console.log('ConversationContext: currentConversation state changed:', currentConversation?.id, currentConversation?.messages?.length);
  }, [currentConversation]);

  const loadConversations = async () => {
    if (!userEmail) return;
    
    try {
      setIsLoading(true);
      console.log('ConversationContext: Loading conversations from Azure API only');
      const azureConversations = await azureConversationService.listUserConversations(userEmail);
      const summaries = azureConversations.map(conv => azureConversationService.convertToSummary(conv));
      setConversations(summaries);
      console.log('ConversationContext: Loaded', summaries.length, 'conversations from Azure');
    } catch (error) {
      console.error('Error loading conversations from Azure:', error);
      // No fallback to localStorage - only Azure storage
      setConversations([]);
    } finally {
      setIsLoading(false);
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
