
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Radio } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { VoiceRecordButton } from './VoiceRecordButton';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  onFilesSelected?: (files: File[]) => void;
  uploadedFiles?: File[];
  onVoiceModeClick?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu mensaje aquí...",
  initialValue = "",
  onValueChange,
  onFilesSelected,
  uploadedFiles = [],
  onVoiceModeClick
}) => {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to auto-resize textarea
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    if (initialValue !== message) {
      setMessage(initialValue);
      // Auto-resize when content is set programmatically (from templates)
      setTimeout(() => {
        autoResizeTextarea();
      }, 0);
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      onValueChange?.("");
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    onValueChange?.(value);
    
    // Auto-resize textarea
    autoResizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  };

  const handleTranscription = (text: string) => {
    const newMessage = message + (message ? ' ' : '') + text;
    setMessage(newMessage);
    onValueChange?.(newMessage);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      autoResizeTextarea();
    }
  };

  const hasMessage = message.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <div className="flex items-end space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 transition-all">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 h-8 w-8 text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[44px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          rows={1}
        />

        <div className="flex items-center space-x-2 flex-shrink-0">
          <VoiceRecordButton 
            onTranscription={handleTranscription}
            disabled={disabled}
          />
          
          {hasMessage ? (
            <Button
              type="submit"
              disabled={disabled || !message.trim()}
              className="h-11 w-11 bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105"
              size="icon"
              aria-label="Enviar mensaje"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            onVoiceModeClick && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onVoiceModeClick}
                className="h-11 w-11 transition-all hover:scale-105 text-gray-500 hover:text-orange-500 hover:bg-gray-100"
                aria-label="Activar modo de voz"
                title="Modo de voz conversacional"
              >
                <Radio className="h-4 w-4" />
              </Button>
            )
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.xlsx,.xls"
      />
    </form>
  );
};
