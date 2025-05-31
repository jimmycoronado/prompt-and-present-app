
import { useState, useEffect } from 'react';
import { persistenceService } from '../services/persistenceService';
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
      await persistenceService.initializeUser(user.email, user.name);
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
      await persistenceService.saveConversation(conversation, user.id);
    } catch (error) {
      console.error('Failed to save conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to save conversation');
    }
  };

  const loadConversation = async (conversationId: string): Promise<Conversation | null> => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      return await persistenceService.loadConversation(conversationId, user.id);
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
      return await persistenceService.getUserConversations(user.id, { archived });
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
      await persistenceService.saveMessageFeedback(messageId, conversationId, user.id, feedback, comment);
    } catch (error) {
      console.error('Failed to save message feedback:', error);
      setError(error instanceof Error ? error.message : 'Failed to save feedback');
    }
  };

  const saveUserSettings = async (aiSettings: AISettings, appSettings: AppSettings) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      await persistenceService.saveUserSettings(user.id, aiSettings, appSettings);
    } catch (error) {
      console.error('Failed to save user settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  const loadUserSettings = async () => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      return await persistenceService.loadUserSettings(user.id);
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
      return await persistenceService.uploadConversationFile(file, conversationId, messageId, user.id);
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
