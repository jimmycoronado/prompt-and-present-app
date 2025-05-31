
import { BlobFile } from '../types/persistence';
import { azureConfig } from '../config/azureConfig';

// Note: This service handles file uploads to Azure Blob Storage
// In a real implementation, this would use a backend API for security

export class BlobStorageService {
  private baseUrl = 'https://your-backend-api.com/api/storage'; // Replace with your actual backend API
  
  async uploadFile(
    file: File, 
    conversationId: string, 
    messageId: string, 
    userId: string
  ): Promise<BlobFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      formData.append('messageId', messageId);
      formData.append('userId', userId);
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        id: result.id,
        conversationId,
        messageId,
        fileName: result.fileName,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        blobUrl: result.blobUrl,
        uploadedAt: new Date(result.uploadedAt),
        userId
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFileUrl(blobId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/file/${blobId}/url`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get file URL: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }

  async deleteFile(blobId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/file/${blobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getConversationFiles(conversationId: string): Promise<BlobFile[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversation/${conversationId}/files`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get conversation files: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting conversation files:', error);
      throw error;
    }
  }

  // Generate a secure upload URL for direct client uploads (alternative approach)
  async getUploadUrl(fileName: string, conversationId: string, messageId: string): Promise<{
    uploadUrl: string;
    blobId: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          fileName,
          conversationId,
          messageId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export const blobStorageService = new BlobStorageService();
