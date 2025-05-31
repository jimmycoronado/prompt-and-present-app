
import { UserProfile, MessageFeedback, SessionMetrics } from '../types/persistence';
import { azureConfig } from '../config/azureConfig';

// Note: In a real implementation, this would use a backend API
// Since Lovable can't run backend code directly, this service will prepare
// the data structures and API calls for external backend services

export class AzureSqlService {
  private baseUrl = 'https://your-backend-api.com/api'; // Replace with your actual backend API
  
  // User Profile Operations
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...profile,
          createdAt: new Date(),
          isActive: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Message Feedback Operations
  async saveMessageFeedback(feedback: Omit<MessageFeedback, 'id' | 'createdAt'>): Promise<MessageFeedback> {
    try {
      const response = await fetch(`${this.baseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...feedback,
          createdAt: new Date()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save message feedback: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving message feedback:', error);
      throw error;
    }
  }

  // Session Metrics Operations
  async saveSessionMetrics(metrics: Omit<SessionMetrics, 'id'>): Promise<SessionMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(metrics)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save session metrics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving session metrics:', error);
      throw error;
    }
  }

  async getUserMetrics(userId: string, timeRange?: { start: Date; end: Date }): Promise<SessionMetrics[]> {
    try {
      let url = `${this.baseUrl}/metrics/user/${userId}`;
      if (timeRange) {
        const params = new URLSearchParams({
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        });
        url += `?${params}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get user metrics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user metrics:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    // In a real implementation, this would get the current user's auth token
    return localStorage.getItem('authToken') || '';
  }
}

export const azureSqlService = new AzureSqlService();
