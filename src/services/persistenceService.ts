
import { azureSqlService } from './azureSqlService';
import { cosmosDbService } from './cosmosDbService';
import { blobStorageService } from './blobStorageService';
import { ChatMessage } from '../types/chat';
import { Conversation } from '../types/conversation';
import { AISettings, AppSettings } from '../types/settings';
import { PromptTemplate } from '../types/templates';

// Unified persistence service that orchestrates all Azure services
export class PersistenceService {
  
  // User Management
  async initializeUser(userEmail: string, userName: string) {
    try {
      console.log('PersistenceService: Initializing user persistence');
      
      // Check if user exists in SQL Server
      let userProfile = await azureSqlService.getUserProfile(userEmail);
      
      if (!userProfile) {
        // Create new user profile
        userProfile = await azureSqlService.createUserProfile({
          email: userEmail,
          name: userName,
          lastLoginAt: new Date(),
          isActive: true
        });
        
        // Log user creation event
        await cosmosDbService.logEvent({
          userId: userProfile.id,
          eventType: 'user_created',
          eventData: { email: userEmail, name: userName }
        });
      } else {
        // Update last login
        await azureSqlService.updateUserProfile(userProfile.id, {
          lastLoginAt: new Date()
        });
        
        // Log login event
        await cosmosDbService.logEvent({
          userId: userProfile.id,
          eventType: 'user_login',
          eventData: { email: userEmail }
        });
      }
      
      return userProfile;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  // Conversation Management
  async saveConversation(conversation: Conversation, userId: string) {
    try {
      console.log('PersistenceService: Saving conversation to Cosmos DB');
      
      const conversationDoc = {
        id: conversation.id,
        userId,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        tags: conversation.tags,
        isArchived: conversation.isArchived,
        totalTokens: conversation.totalTokens
      };
      
      await cosmosDbService.saveConversation(conversationDoc);
      
      // Log conversation save event
      await cosmosDbService.logEvent({
        userId,
        eventType: 'conversation_saved',
        eventData: { 
          conversationId: conversation.id,
          messageCount: conversation.messages.length 
        },
        conversationId: conversation.id
      });
      
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async loadConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    try {
      console.log('PersistenceService: Loading conversation from Cosmos DB');
      
      const conversationDoc = await cosmosDbService.getConversation(conversationId, userId);
      
      if (!conversationDoc) {
        return null;
      }
      
      // Log conversation load event
      await cosmosDbService.logEvent({
        userId,
        eventType: 'conversation_loaded',
        eventData: { conversationId },
        conversationId
      });
      
      return {
        id: conversationDoc.id,
        title: conversationDoc.title,
        messages: conversationDoc.messages,
        createdAt: conversationDoc.createdAt,
        updatedAt: conversationDoc.updatedAt,
        tags: conversationDoc.tags,
        isArchived: conversationDoc.isArchived,
        totalTokens: conversationDoc.totalTokens
      };
      
    } catch (error) {
      console.error('Error loading conversation:', error);
      throw error;
    }
  }

  async getUserConversations(userId: string, options?: { archived?: boolean }) {
    try {
      return await cosmosDbService.getUserConversations(userId, options);
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  // Message Feedback
  async saveMessageFeedback(
    messageId: string, 
    conversationId: string, 
    userId: string, 
    feedback: 'positive' | 'negative',
    comment?: string
  ) {
    try {
      console.log('PersistenceService: Saving message feedback to SQL Server');
      
      await azureSqlService.saveMessageFeedback({
        messageId,
        conversationId,
        userId,
        feedback,
        comment
      });
      
      // Log feedback event
      await cosmosDbService.logEvent({
        userId,
        eventType: 'message_feedback',
        eventData: { 
          messageId, 
          conversationId, 
          feedback,
          ...(comment && { comment })
        },
        conversationId
      });
      
    } catch (error) {
      console.error('Error saving message feedback:', error);
      throw error;
    }
  }

  // Settings Management
  async saveUserSettings(userId: string, aiSettings: AISettings, appSettings: AppSettings) {
    try {
      console.log('PersistenceService: Saving user settings to Cosmos DB');
      
      // Save AI settings
      await cosmosDbService.saveConfiguration({
        id: `${userId}_ai_settings`,
        userId,
        type: 'ai',
        settings: aiSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Save App settings
      await cosmosDbService.saveConfiguration({
        id: `${userId}_app_settings`,
        userId,
        type: 'app',
        settings: appSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  async loadUserSettings(userId: string): Promise<{
    aiSettings: AISettings | null;
    appSettings: AppSettings | null;
  }> {
    try {
      console.log('PersistenceService: Loading user settings from Cosmos DB');
      
      const [aiConfig, appConfig] = await Promise.all([
        cosmosDbService.getUserConfiguration(userId, 'ai'),
        cosmosDbService.getUserConfiguration(userId, 'app')
      ]);
      
      return {
        aiSettings: aiConfig?.settings as AISettings || null,
        appSettings: appConfig?.settings as AppSettings || null
      };
      
    } catch (error) {
      console.error('Error loading user settings:', error);
      return { aiSettings: null, appSettings: null };
    }
  }

  // File Management
  async uploadConversationFile(
    file: File, 
    conversationId: string, 
    messageId: string, 
    userId: string
  ) {
    try {
      console.log('PersistenceService: Uploading file to Blob Storage');
      
      const blobFile = await blobStorageService.uploadFile(file, conversationId, messageId, userId);
      
      // Log file upload event
      await cosmosDbService.logEvent({
        userId,
        eventType: 'file_uploaded',
        eventData: { 
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          conversationId,
          messageId
        },
        conversationId
      });
      
      return blobFile;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Session Metrics
  async saveSessionMetrics(userId: string, conversationId: string, metrics: {
    messageCount: number;
    tokensUsed: number;
    apiCalls: number;
    avgResponseTime: number;
    startTime: Date;
    endTime: Date;
  }) {
    try {
      console.log('PersistenceService: Saving session metrics to SQL Server');
      
      await azureSqlService.saveSessionMetrics({
        userId,
        conversationId,
        ...metrics
      });
      
    } catch (error) {
      console.error('Error saving session metrics:', error);
      throw error;
    }
  }
}

export const persistenceService = new PersistenceService();
