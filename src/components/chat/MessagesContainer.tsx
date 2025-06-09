
import { useRef, useEffect } from "react";
import { ChatMessage } from "../ChatMessage";
import { ChatMessage as ChatMessageType } from "../../types/chat";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";
import { PromptTemplate } from "../../types/templates";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main 
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${
        isMobile && isLoading ? 'pb-32' : ''
      }`}
      role="main" 
      aria-label="Conversación"
    >
      {messages.length === 0 && (
        <EmptyState 
          templates={templates}
          onSelectTemplate={onSelectTemplate}
        />
      )}

      {messages.map((message) => {
        console.log('ChatInterface: Rendering message:', message.id, message.type, message.content.substring(0, 50));
        return (
          <ChatMessage
            key={message.id}
            message={message}
            isSelected={selectedMessage?.id === message.id}
            onClick={() => onSelectMessage(message)}
          />
        );
      })}

      <LoadingIndicator isLoading={isLoading} />

      <div ref={messagesEndRef} />
    </main>
  );
};
