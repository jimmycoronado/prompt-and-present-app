
import { ConversationDocument, TemplateDocument, ConfigurationDocument, EventLog } from '../types/persistence';
import { azureConfig } from '../config/azureConfig';

// Note: This service prepares data for Cosmos DB operations
// In a real implementation, this would connect through a backend API

export class CosmosDbService {
  private baseUrl = 'https://your-backend-api.com/api/cosmos'; // Replace with your actual backend API
  
  // Conversation Operations
  async saveConversation(conversation: ConversationDocument): Promise<ConversationDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...conversation,
          _partitionKey: conversation.userId // Cosmos DB partition key
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save conversation: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string, userId: string): Promise<ConversationDocument | null> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-User-Id': userId
        }
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get conversation: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  async getUserConversations(userId: string, options?: {
    archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ConversationDocument[]> {
    try {
      const params = new URLSearchParams({
        userId,
        ...(options?.archived !== undefined && { archived: options.archived.toString() }),
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });
      
      const response = await fetch(`${this.baseUrl}/conversations?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get user conversations: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-User-Id': userId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Template Operations
  async saveTemplate(template: TemplateDocument): Promise<TemplateDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...template,
          _partitionKey: template.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  async getUserTemplates(userId: string): Promise<TemplateDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get user templates: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user templates:', error);
      throw error;
    }
  }

  // Configuration Operations
  async saveConfiguration(config: ConfigurationDocument): Promise<ConfigurationDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/configurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...config,
          _partitionKey: config.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save configuration: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }

  async getUserConfiguration(userId: string, type: string): Promise<ConfigurationDocument | null> {
    try {
      const response = await fetch(`${this.baseUrl}/configurations?userId=${userId}&type=${type}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get user configuration: ${response.statusText}`);
      }
      
      const configs = await response.json();
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error('Error getting user configuration:', error);
      throw error;
    }
  }

  // Event Logging
  async logEvent(event: Omit<EventLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date(),
          _partitionKey: event.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error logging event:', error);
      // Don't throw error for logging failures to avoid disrupting user experience
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export const cosmosDbService = new CosmosDbService();
