
import { useState, useRef, useEffect } from "react";
import { Send, FileTemplate } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
  onValueChange?: (value: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled, 
  initialValue = "",
  onValueChange 
}) => {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue !== message) {
      setMessage(initialValue);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      }
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      onValueChange?.("");
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
    const value = e.target.value;
    setMessage(value);
    onValueChange?.(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const hasTemplateVariables = message.includes('{') && message.includes('}');

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
            className={`min-h-[44px] max-h-[200px] resize-none pr-12 rounded-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all ${
              hasTemplateVariables ? 'border-orange-300 dark:border-orange-600' : ''
            }`}
            aria-label="Mensaje"
            aria-describedby="send-button"
          />
          
          {hasTemplateVariables && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <FileTemplate className="h-4 w-4 text-orange-500" />
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 w-11 transition-all hover:scale-105"
          aria-label="Enviar mensaje"
          id="send-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {hasTemplateVariables && (
        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center">
          <FileTemplate className="h-3 w-3 mr-1" />
          Reemplaza las variables entre llaves {} con tus valores específicos
        </div>
      )}
      
      {disabled && (
        <div className="sr-only" aria-live="polite">
          Procesando mensaje, por favor espera...
        </div>
      )}
    </form>
  );
};
