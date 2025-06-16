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
    const endpoint = `${API_BASE_URL}/conversations`;
    
    // Generate unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const requestBody = {
      id: conversationId,
      userId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
      tags: [],
      isArchived: false,
      totalTokens: 0,
      attachments: []
    };

    console.log('🚀 AZURE API REQUEST - CREATE CONVERSATION');
    console.log('📍 Endpoint:', endpoint);
    console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🆔 Generated Conversation ID:', conversationId);
    console.log('👤 User ID:', userId);
    console.log('📝 Title:', title);
    console.log('⏰ Created/Updated At:', now);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to create conversation: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));
      console.log('🆔 Created Conversation ID:', result.id);

      return result.id || conversationId;
    } catch (error) {
      console.error('💥 AZURE API ERROR - CREATE CONVERSATION:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
      throw error;
    }
  }

  // Obtener conversación por ID
  async getConversation(conversationId: string, userEmail: string): Promise<AzureConversation | null> {
    const endpoint = `${API_BASE_URL}/conversation/${conversationId}?user_id=${encodeURIComponent(userEmail)}`;
    
    console.log('🚀 AZURE API REQUEST - GET CONVERSATION');
    console.log('📍 Endpoint:', endpoint);
    console.log('🆔 Conversation ID:', conversationId);
    console.log('👤 User Email:', userEmail);

    try {
      const response = await fetch(endpoint);
      
      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 Conversation not found (404)');
          return null;
        }
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to get conversation: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('💥 AZURE API ERROR - GET CONVERSATION:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Listar conversaciones de un usuario - FIXED ENDPOINT URL
  async listUserConversations(userEmail: string): Promise<AzureConversation[]> {
    const endpoint = `${API_BASE_URL}/listconversations/${encodeURIComponent(userEmail)}`;
    
    console.log('🚀 AZURE API REQUEST - LIST CONVERSATIONS');
    console.log('📍 Endpoint:', endpoint);
    console.log('👤 User Email:', userEmail);
    console.log('🔗 Method: GET');
    console.log('📦 Body: None (GET request)');

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to list conversations: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));
      console.log('📊 Number of conversations:', Array.isArray(result) ? result.length : 'Not an array!');
      console.log('🔍 Response type:', typeof result);
      console.log('🔍 Is Array:', Array.isArray(result));

      // Ensure we return an array
      if (!Array.isArray(result)) {
        console.warn('⚠️ API response is not an array, wrapping in array or returning empty array');
        return [];
      }

      return result;
    } catch (error) {
      console.error('💥 AZURE API ERROR - LIST CONVERSATIONS:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
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

  // Obtener banners del usuario
  async getUserBanners(userEmail: string): Promise<any[]> {
    const endpoint = `${API_BASE_URL}/banner/${encodeURIComponent(userEmail)}`;
    
    console.log('🚀 AZURE API REQUEST - GET USER BANNERS');
    console.log('📍 Endpoint:', endpoint);
    console.log('👤 User Email:', userEmail);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 No banners found for user (404)');
          return [];
        }
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to get user banners: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));
      console.log('📊 Number of banners:', Array.isArray(result) ? result.length : 0);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('💥 AZURE API ERROR - GET USER BANNERS:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
      // Return empty array instead of throwing to avoid breaking the UI
      console.warn('⚠️ Returning empty banners array due to API error');
      return [];
    }
  }

  // Convertir conversación de Azure a formato interno
  convertToInternalFormat(azureConv: AzureConversation, files: AzureFileInfo[] = []): Conversation {
    const messages: ChatMessage[] = azureConv.messages.map((msg, index) => {
      // Ensure timestamp is a proper Date object
      let timestamp: Date;
      if (typeof msg.timestamp === 'string') {
        timestamp = new Date(msg.timestamp);
        // Validate the date is valid
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid timestamp received from Azure:', msg.timestamp, 'using current time');
          timestamp = new Date();
        }
      } else {
        // If it's not a string, treat it as invalid and use current time
        console.warn('Unexpected timestamp type from Azure:', typeof msg.timestamp, 'using current time');
        timestamp = new Date();
      }
      
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

    // Ensure conversation dates are proper Date objects
    let createdAt: Date;
    let updatedAt: Date;
    
    if (typeof azureConv.createdAt === 'string') {
      createdAt = new Date(azureConv.createdAt);
      if (isNaN(createdAt.getTime())) {
        console.warn('Invalid createdAt from Azure:', azureConv.createdAt);
        createdAt = new Date();
      }
    } else {
      // If it's not a string, use current time
      createdAt = new Date();
    }

    if (typeof azureConv.updatedAt === 'string') {
      updatedAt = new Date(azureConv.updatedAt);
      if (isNaN(updatedAt.getTime())) {
        console.warn('Invalid updatedAt from Azure:', azureConv.updatedAt);
        updatedAt = new Date();
      }
    } else {
      // If it's not a string, use current time
      updatedAt = new Date();
    }

    return {
      id: azureConv.id,
      title: azureConv.title,
      messages,
      createdAt,
      updatedAt,
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
