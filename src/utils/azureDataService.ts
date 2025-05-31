
import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { PromptTemplate, TemplateCategory } from '../types/templates';

const AZURE_API_BASE_URL = 'https://jarvis-api-agente-sql.azurewebsites.net';

interface AzureApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usuarios y perfiles
export const saveUserProfile = async (userEmail: string, profile: any): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/users/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, profile })
  });
  
  if (!response.ok) {
    throw new Error('Error al guardar perfil de usuario');
  }
};

export const getUserProfile = async (userEmail: string): Promise<any> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/users/${encodeURIComponent(userEmail)}/profile`);
  
  if (!response.ok) {
    throw new Error('Error al obtener perfil de usuario');
  }
  
  const result: AzureApiResponse = await response.json();
  return result.data;
};

// Conversaciones
export const saveConversation = async (userEmail: string, conversation: Conversation): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userEmail, 
      conversation: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Error al guardar conversación');
  }
};

export const updateConversation = async (userEmail: string, conversation: Conversation): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/conversations/${conversation.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userEmail, 
      conversation: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar conversación');
  }
};

export const getUserConversations = async (userEmail: string): Promise<ConversationSummary[]> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/users/${encodeURIComponent(userEmail)}/conversations`);
  
  if (!response.ok) {
    throw new Error('Error al obtener conversaciones');
  }
  
  const result: AzureApiResponse<ConversationSummary[]> = await response.json();
  return (result.data || []).map(conv => ({
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt)
  }));
};

export const getConversation = async (userEmail: string, conversationId: string): Promise<Conversation | null> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/conversations/${conversationId}?userEmail=${encodeURIComponent(userEmail)}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Error al obtener conversación');
  }
  
  const result: AzureApiResponse<Conversation> = await response.json();
  if (!result.data) return null;
  
  return {
    ...result.data,
    createdAt: new Date(result.data.createdAt),
    updatedAt: new Date(result.data.updatedAt),
    messages: result.data.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  };
};

export const deleteConversation = async (userEmail: string, conversationId: string): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail })
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar conversación');
  }
};

export const archiveConversation = async (userEmail: string, conversationId: string): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/conversations/${conversationId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail })
  });
  
  if (!response.ok) {
    throw new Error('Error al archivar conversación');
  }
};

// Feedback de mensajes
export const saveMessageFeedback = async (
  userEmail: string, 
  conversationId: string, 
  messageId: string, 
  feedback: 'positive' | 'negative',
  comment?: string
): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail,
      conversationId,
      messageId,
      feedback,
      comment
    })
  });
  
  if (!response.ok) {
    throw new Error('Error al guardar feedback');
  }
};

// Plantillas de prompts
export const getUserTemplates = async (userEmail: string): Promise<PromptTemplate[]> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/users/${encodeURIComponent(userEmail)}/templates`);
  
  if (!response.ok) {
    throw new Error('Error al obtener plantillas');
  }
  
  const result: AzureApiResponse<PromptTemplate[]> = await response.json();
  return result.data || [];
};

export const saveTemplate = async (userEmail: string, template: PromptTemplate): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, template })
  });
  
  if (!response.ok) {
    throw new Error('Error al guardar plantilla');
  }
};

export const deleteTemplate = async (userEmail: string, templateId: string): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/templates/${templateId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail })
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar plantilla');
  }
};

// Configuraciones de usuario
export const saveUserSettings = async (userEmail: string, settings: any): Promise<void> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/users/${encodeURIComponent(userEmail)}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings })
  });
  
  if (!response.ok) {
    throw new Error('Error al guardar configuraciones');
  }
};

export const getUserSettings = async (userEmail: string): Promise<any> => {
  const response = await fetch(`${AZURE_API_BASE_URL}/users/${encodeURIComponent(userEmail)}/settings`);
  
  if (!response.ok) {
    return {}; // Retorna configuración por defecto si no existe
  }
  
  const result: AzureApiResponse = await response.json();
  return result.data || {};
};
