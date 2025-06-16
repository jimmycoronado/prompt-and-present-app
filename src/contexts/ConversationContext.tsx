
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
  const [azureAvailable, setAzureAvailable] = useState(true);
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
      const azureConversations = await azureConversationService.listUserConversations(userEmail);
      const summaries = azureConversations.map(conv => azureConversationService.convertToSummary(conv));
      setConversations(summaries);
      setAzureAvailable(true);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setAzureAvailable(false);
      // Load from localStorage as fallback
      try {
        const localConversations = localStorage.getItem(`conversations_${userEmail}`);
        if (localConversations) {
          const parsed = JSON.parse(localConversations);
          setConversations(parsed);
        }
      } catch (localError) {
        console.error('Error loading local conversations:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (): Promise<string> => {
    if (!userEmail) throw new Error('User not authenticated');
    
    console.log('ConversationContext: Creating new conversation');
    
    // Generate a local conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newConversation: Conversation = {
      id: conversationId,
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

    // Try to save to Azure, but don't fail if it's not available
    if (azureAvailable) {
      try {
        const azureConversationId = await azureConversationService.createConversation(userEmail, 'Nueva conversación');
        // Update with Azure ID if successful
        const updatedConversation = { ...newConversation, id: azureConversationId };
        setCurrentConversation(updatedConversation);
        
        // Reload conversations list
        await loadConversations();
        
        return azureConversationId;
      } catch (error) {
        console.error('Error creating conversation in Azure:', error);
        setAzureAvailable(false);
        // Continue with local conversation
      }
    }

    // Save locally as fallback
    try {
      const localConversations = localStorage.getItem(`conversations_${userEmail}`);
      const conversations = localConversations ? JSON.parse(localConversations) : [];
      const newSummary: ConversationSummary = {
        id: conversationId,
        title: 'Nueva conversación',
        messageCount: 0,
        lastMessage: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: []
      };
      conversations.unshift(newSummary);
      localStorage.setItem(`conversations_${userEmail}`, JSON.stringify(conversations));
      setConversations(conversations);
    } catch (error) {
      console.error('Error saving conversation locally:', error);
    }
    
    return conversationId;
  };

  const loadConversation = async (id: string) => {
    if (!userEmail) return;
    
    setIsLoading(true);
    try {
      if (azureAvailable) {
        const azureConv = await azureConversationService.getConversation(id, userEmail);
        if (azureConv) {
          // Obtener archivos de la conversación
          const files = await azureConversationService.getConversationFiles(id, userEmail);
          const loadedConversation = azureConversationService.convertToInternalFormat(azureConv, files);
          setCurrentConversation(loadedConversation);
          console.log('ConversationContext: Loaded conversation with messages:', loadedConversation.messages.length);
          return;
        }
      }
      
      // Fallback to localStorage
      const localConversation = localStorage.getItem(`conversation_${id}`);
      if (localConversation) {
        const parsed = JSON.parse(localConversation);
        setCurrentConversation(parsed);
        console.log('ConversationContext: Loaded local conversation with messages:', parsed.messages.length);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setAzureAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    if (!userEmail) return;
    
    try {
      // Always save locally first
      localStorage.setItem(`conversation_${conversation.id}`, JSON.stringify(conversation));
      
      if (azureAvailable) {
        const azureFormat = azureConversationService.convertToAzureFormat(conversation);
        await azureConversationService.updateConversation(conversation.id, userEmail, azureFormat);
        
        // Update the conversations list
        await loadConversations();
      } else {
        // Update local conversations list
        const localConversations = localStorage.getItem(`conversations_${userEmail}`);
        const conversations = localConversations ? JSON.parse(localConversations) : [];
        const existingIndex = conversations.findIndex((c: ConversationSummary) => c.id === conversation.id);
        
        const summary: ConversationSummary = {
          id: conversation.id,
          title: conversation.title,
          messageCount: conversation.messages.length,
          lastMessage: conversation.messages[conversation.messages.length - 1]?.content || '',
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          tags: conversation.tags
        };
        
        if (existingIndex >= 0) {
          conversations[existingIndex] = summary;
        } else {
          conversations.unshift(summary);
        }
        
        localStorage.setItem(`conversations_${userEmail}`, JSON.stringify(conversations));
        setConversations(conversations);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      setAzureAvailable(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      // Remove from local storage
      localStorage.removeItem(`conversation_${id}`);
      
      if (azureAvailable) {
        // TODO: Implementar endpoint de eliminación en el backend de Azure
        // Por ahora, solo removemos de la lista local
      }
      
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const archiveConversation = async (id: string) => {
    if (!userEmail) return;
    
    try {
      if (azureAvailable) {
        // TODO: Implementar archivado en el backend de Azure
        // Por ahora, marcamos como archivada localmente
        const conversation = conversations.find(c => c.id === id);
        if (conversation) {
          // Aquí podrías llamar al endpoint de actualización
          await loadConversations();
        }
      }
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
      
      // Save conversation (async, but don't block UI)
      saveConversation(updatedConversation).catch(error => {
        console.error('Error saving conversation:', error);
      });

      console.log('ConversationContext: END addMessageToCurrentConversation');
      return updatedConversation;
    });
  }, [userEmail]);

  const updateConversationTitle = async (id: string, title: string) => {
    if (!userEmail) return;
    
    try {
      const conversation = currentConversation;
      if (conversation && conversation.id === id) {
        const updatedConversation = { ...conversation, title, updatedAt: new Date() };
        await saveConversation(updatedConversation);
        setCurrentConversation(updatedConversation);
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const uploadFileToConversation = async (file: File, conversationId: string): Promise<string> => {
    if (!userEmail) throw new Error('User not authenticated');
    
    try {
      if (azureAvailable) {
        const fileName = await azureConversationService.uploadFile(file, userEmail, conversationId);
        console.log('File uploaded to Azure:', fileName);
        return fileName;
      } else {
        // Fallback: return a local reference
        const fileName = `${Date.now()}_${file.name}`;
        console.log('Azure not available, using local file reference:', fileName);
        return fileName;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setAzureAvailable(false);
      // Return local reference as fallback
      const fileName = `${Date.now()}_${file.name}`;
      return fileName;
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
