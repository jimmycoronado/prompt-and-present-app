
import { useState, useEffect } from 'react';
import { azureConversationService } from '../services/azureConversationService';
import { useAuth } from '../contexts/AuthContext';
import { Conversation } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { AISettings, AppSettings } from '../types/settings';

export const usePersistence = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isInitialized) {
      initializeUserPersistence();
    }
  }, [user, isInitialized]);

  const initializeUserPersistence = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('usePersistence: Initializing user persistence for:', user.email);
      // Con Azure, la inicialización es automática cuando el usuario hace login
      // Las conversaciones se cargan automáticamente en el ConversationContext
      setIsInitialized(true);
      
    } catch (error) {
      console.error('Failed to initialize user persistence:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize persistence');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      const azureFormat = azureConversationService.convertToAzureFormat(conversation);
      await azureConversationService.updateConversation(conversation.id, user.email, azureFormat);
    } catch (error) {
      console.error('Failed to save conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to save conversation');
    }
  };

  const loadConversation = async (conversationId: string): Promise<Conversation | null> => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      const azureConv = await azureConversationService.getConversation(conversationId, user.email);
      if (azureConv) {
        const files = await azureConversationService.getConversationFiles(conversationId, user.email);
        return azureConversationService.convertToInternalFormat(azureConv, files);
      }
      return null;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversation');
      return null;
    }
  };

  const getUserConversations = async (archived = false) => {
    if (!user || !isInitialized) return [];
    
    try {
      setError(null);
      const azureConversations = await azureConversationService.listUserConversations(user.email);
      const filtered = azureConversations.filter(conv => conv.isArchived === archived);
      return filtered.map(conv => azureConversationService.convertToSummary(conv));
    } catch (error) {
      console.error('Failed to get user conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to get conversations');
      return [];
    }
  };

  const saveMessageFeedback = async (
    messageId: string,
    conversationId: string,
    feedback: 'positive' | 'negative',
    comment?: string
  ) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      // TODO: Implementar endpoint de feedback en Azure
      console.log('Message feedback saved:', { messageId, conversationId, feedback, comment });
    } catch (error) {
      console.error('Failed to save message feedback:', error);
      setError(error instanceof Error ? error.message : 'Failed to save feedback');
    }
  };

  const saveUserSettings = async (aiSettings: AISettings, appSettings: AppSettings) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      // TODO: Implementar guardado de configuraciones en Azure
      console.log('User settings saved:', { aiSettings, appSettings });
    } catch (error) {
      console.error('Failed to save user settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  const loadUserSettings = async () => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      // TODO: Implementar carga de configuraciones desde Azure
      console.log('Loading user settings from Azure');
      return null;
    } catch (error) {
      console.error('Failed to load user settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
      return null;
    }
  };

  const uploadFile = async (file: File, conversationId: string, messageId: string) => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      const fileName = await azureConversationService.uploadFile(file, user.email, conversationId);
      return {
        fileName,
        url: `https://skcoDaliAIDev.azurewebsites.net/api/files/${fileName}`,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      return null;
    }
  };

  return {
    isInitialized,
    isLoading,
    error,
    saveConversation,
    loadConversation,
    getUserConversations,
    saveMessageFeedback,
    saveUserSettings,
    loadUserSettings,
    uploadFile
  };
};
