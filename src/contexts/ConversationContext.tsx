import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';

interface ConversationContextType {
  conversations: ConversationSummary[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  createNewConversation: () => string;
  loadConversation: (id: string) => Promise<void>;
  saveConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  searchConversations: (query: string) => ConversationSummary[];
  addMessageToCurrentConversation: (message: ChatMessage) => void;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  // Log currentConversation changes
  useEffect(() => {
    console.log('ConversationContext: currentConversation state changed:', currentConversation?.id, currentConversation?.messages?.length);
  }, [currentConversation]);

  const loadConversations = () => {
    try {
      const saved = localStorage.getItem('ai-chat-conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        })));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveConversations = (convs: ConversationSummary[]) => {
    try {
      localStorage.setItem('ai-chat-conversations', JSON.stringify(convs));
      setConversations(convs);
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  const createNewConversation = (): string => {
    console.log('ConversationContext: Creating new conversation');
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
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
    return newId;
  };

  const loadConversation = async (id: string) => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem(`ai-chat-conversation-${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentConversation({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
          messages: parsed.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    try {
      console.log('ConversationContext: Saving conversation to localStorage:', conversation.id, conversation.messages.length);
      // Save full conversation
      localStorage.setItem(`ai-chat-conversation-${conversation.id}`, JSON.stringify(conversation));
      
      // Update summary
      const summary: ConversationSummary = {
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation.messages.length,
        lastMessage: conversation.messages[conversation.messages.length - 1]?.content || '',
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        tags: conversation.tags
      };

      const updatedConversations = conversations.filter(c => c.id !== conversation.id);
      updatedConversations.unshift(summary);
      saveConversations(updatedConversations);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      localStorage.removeItem(`ai-chat-conversation-${id}`);
      const updated = conversations.filter(c => c.id !== id);
      saveConversations(updated);
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const archiveConversation = async (id: string) => {
    try {
      const saved = localStorage.getItem(`ai-chat-conversation-${id}`);
      if (saved) {
        const conversation = JSON.parse(saved);
        conversation.isArchived = true;
        localStorage.setItem(`ai-chat-conversation-${id}`, JSON.stringify(conversation));
        loadConversations();
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

  const addMessageToCurrentConversation = (message: ChatMessage) => {
    console.log('ConversationContext: START addMessageToCurrentConversation with message:', message.id, message.type, message.content.substring(0, 50));
    
    if (!currentConversation) {
      console.warn('ConversationContext: No current conversation to add message to');
      return;
    }

    console.log('ConversationContext: Current conversation before update:', currentConversation.id, currentConversation.messages.length);

    // Create updated conversation with new message
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      updatedAt: new Date(),
      title: currentConversation.messages.length === 0 ? 
        message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '') : 
        currentConversation.title
    };

    console.log('ConversationContext: Updated conversation created:', updatedConversation.id, updatedConversation.messages.length);
    console.log('ConversationContext: All messages in updated conversation:', updatedConversation.messages.map(m => `${m.id}:${m.type}:${m.content.substring(0, 20)}`));
    
    // Update state immediately
    console.log('ConversationContext: Setting currentConversation state...');
    setCurrentConversation(updatedConversation);
    
    // Save asynchronously without blocking UI
    console.log('ConversationContext: Scheduling async save...');
    setTimeout(() => {
      console.log('ConversationContext: Executing async save...');
      saveConversation(updatedConversation);
    }, 0);

    console.log('ConversationContext: END addMessageToCurrentConversation');
  };

  const updateConversationTitle = async (id: string, title: string) => {
    try {
      const saved = localStorage.getItem(`ai-chat-conversation-${id}`);
      if (saved) {
        const conversation = JSON.parse(saved);
        conversation.title = title;
        conversation.updatedAt = new Date();
        await saveConversation(conversation);
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
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
      updateConversationTitle
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
