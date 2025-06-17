
import React from "react";
import { ChatMessage as ChatMessageType } from "../../types/chat";
import { PromptTemplate } from "../../types/templates";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";
import { ChatMessage } from "../ChatMessage";
import { useIsMobile } from "../../hooks/use-mobile";

interface MessagesContainerProps {
  messages: ChatMessageType[];
  selectedMessage: ChatMessageType | null;
  onSelectMessage: (message: ChatMessageType | null) => void;
  isLoading: boolean;
  templates: PromptTemplate[];
  onSelectTemplate: (content: string) => void;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({
  messages,
  selectedMessage,
  onSelectMessage,
  isLoading,
  templates,
  onSelectTemplate
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-4' : ''}`}>
      {messages.length === 0 ? (
        <EmptyState 
          templates={templates}
          onSelectTemplate={onSelectTemplate}
        />
      ) : (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isSelected={selectedMessage?.id === message.id}
              onSelect={() => onSelectMessage(selectedMessage?.id === message.id ? null : message)}
            />
          ))}
          
          {/* Mostrar indicador de carga al final de los mensajes */}
          <LoadingIndicator isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};
