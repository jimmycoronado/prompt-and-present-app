
import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';

const API_BASE_URL = 'https://skcoDaliAIDev.azurewebsites.net/api';

export interface AzureConversation {
  id: string;
  userId: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isArchived: boolean;
  totalTokens: number;
  attachments: string[];
}

export interface AzureFileInfo {
  fileName: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export class AzureConversationService {
  
  // Crear nueva conversación
  async createConversation(userId: string, title: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          messages: [],
          tags: [],
          isArchived: false,
          totalTokens: 0,
          attachments: []
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Obtener conversación por ID
  async getConversation(conversationId: string, userEmail: string): Promise<AzureConversation | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}?user_id=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Listar conversaciones de un usuario
  async listUserConversations(userEmail: string): Promise<AzureConversation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/listconversation/${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to list conversations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  }

  // Actualizar conversación
  async updateConversation(conversationId: string, userEmail: string, conversation: Partial<AzureConversation>): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}?user_id=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation)
      });

      if (!response.ok) {
        throw new Error(`Failed to update conversation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // Subir archivo
  async uploadFile(file: File, userEmail: string, conversationId: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_email', userEmail);
      formData.append('conversation_id', conversationId);

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const result = await response.json();
      return result.fileName || result.blob_id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Obtener archivos de una conversación
  async getConversationFiles(conversationId: string, userEmail: string): Promise<AzureFileInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/conversation/${conversationId}?user_email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get conversation files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation files:', error);
      return [];
    }
  }

  // Obtener URL de descarga de archivo
  async getFileDownloadUrl(blobId: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${blobId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get file download URL: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error getting file download URL:', error);
      throw error;
    }
  }

  // Convertir conversación de Azure a formato interno
  convertToInternalFormat(azureConv: AzureConversation, files: AzureFileInfo[] = []): Conversation {
    const messages: ChatMessage[] = azureConv.messages.map((msg, index) => {
      const timestamp = new Date(msg.timestamp);
      
      // Buscar archivos que corresponden a este mensaje
      const messageFiles = files.filter(file => {
        const fileUploadTime = new Date(file.uploaded_at);
        return fileUploadTime <= timestamp && 
               (index === azureConv.messages.length - 1 || 
                fileUploadTime <= new Date(azureConv.messages[index + 1]?.timestamp || Date.now()));
      });

      return {
        id: `${azureConv.id}_${index}`,
        type: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp,
        files: messageFiles.length > 0 ? messageFiles.map(file => ({
          name: file.fileName,
          size: 0, // No disponible en la respuesta de Azure
          type: 'application/octet-stream', // Tipo genérico
          url: file.url
        })) : undefined
      };
    });

    return {
      id: azureConv.id,
      title: azureConv.title,
      messages,
      createdAt: new Date(azureConv.createdAt),
      updatedAt: new Date(azureConv.updatedAt),
      tags: azureConv.tags,
      isArchived: azureConv.isArchived,
      totalTokens: azureConv.totalTokens
    };
  }

  // Convertir conversación interna a formato de Azure
  convertToAzureFormat(conversation: Conversation): Partial<AzureConversation> {
    return {
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      })),
      tags: conversation.tags,
      isArchived: conversation.isArchived,
      totalTokens: conversation.totalTokens,
      updatedAt: conversation.updatedAt.toISOString()
    };
  }

  // Convertir a resumen de conversación
  convertToSummary(azureConv: AzureConversation): ConversationSummary {
    return {
      id: azureConv.id,
      title: azureConv.title,
      messageCount: azureConv.messages.length,
      lastMessage: azureConv.messages[azureConv.messages.length - 1]?.content || '',
      createdAt: new Date(azureConv.createdAt),
      updatedAt: new Date(azureConv.updatedAt),
      tags: azureConv.tags
    };
  }
}

export const azureConversationService = new AzureConversationService();
