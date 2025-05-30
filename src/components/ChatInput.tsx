
import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="relative" role="search" aria-label="Enviar mensaje">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)"
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] resize-none pr-12 rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            aria-label="Mensaje"
            aria-describedby="send-button"
          />
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 w-11"
          aria-label="Enviar mensaje"
          id="send-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {disabled && (
        <div className="sr-only" aria-live="polite">
          Procesando mensaje, por favor espera...
        </div>
      )}
    </form>
  );
};
