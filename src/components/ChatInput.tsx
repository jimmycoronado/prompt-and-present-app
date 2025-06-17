
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Paperclip, Radio } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { VoiceRecordButton } from './VoiceRecordButton';
import { useIsMobile } from '../hooks/use-mobile';

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

export interface ChatInputRef {
  sendBannerMessage: (automaticReply: string) => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu mensaje aquí...",
  initialValue = "",
  onValueChange,
  onFilesSelected,
  uploadedFiles = [],
  onVoiceModeClick
}, ref) => {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Function to auto-resize textarea with mobile compatibility
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Reset height first
      textarea.style.height = 'auto';
      
      // Force a reflow for mobile browsers
      textarea.offsetHeight;
      
      // Calculate new height
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
      
      // Additional mobile-specific handling
      if (window.innerWidth < 768) {
        // Force another reflow on mobile
        requestAnimationFrame(() => {
          textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        });
      }
    }
  };

  useEffect(() => {
    if (initialValue !== message) {
      setMessage(initialValue);
      // Auto-resize when content is set programmatically (from templates)
      // Use multiple frames for mobile compatibility
      setTimeout(() => {
        autoResizeTextarea();
        // Additional timeout for mobile browsers
        setTimeout(() => {
          autoResizeTextarea();
        }, 50);
      }, 0);
    }
  }, [initialValue]);

  // Exposed method for banner messages
  const sendBannerMessage = (automaticReply: string) => {
    console.log('📝 ChatInput: Sending banner message:', automaticReply);
    setMessage(automaticReply);
    onValueChange?.(automaticReply);
    
    // Auto-resize textarea
    setTimeout(() => {
      autoResizeTextarea();
      // Send the message automatically after a brief delay
      setTimeout(() => {
        if (automaticReply.trim()) {
          onSendMessage(automaticReply.trim());
          setMessage("");
          onValueChange?.("");
          
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        }
      }, 100);
    }, 0);
  };

  // Expose the method via ref
  useImperativeHandle(ref, () => ({
    sendBannerMessage
  }));

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
    if (disabled) return; // Prevenir cambios cuando está deshabilitado
    
    const value = e.target.value;
    setMessage(value);
    onValueChange?.(value);
    
    // Auto-resize textarea
    autoResizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
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
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  };

  const handleTranscription = (text: string) => {
    if (disabled) return;
    
    const newMessage = message + (message ? ' ' : '') + text;
    setMessage(newMessage);
    onValueChange?.(newMessage);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      autoResizeTextarea();
    }
  };

  const hasMessage = message.trim().length > 0;

  // Mostrar placeholder diferente cuando está cargando
  const displayPlaceholder = disabled ? "Esperando respuesta del agente..." : placeholder;

  // Mobile design similar to ChatGPT
  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        {/* Main input container with clean design */}
        <div className={`relative bg-white dark:bg-gray-800 rounded-2xl border shadow-sm mx-4 transition-all ${
          disabled 
            ? 'border-gray-200 dark:border-gray-700 opacity-60' 
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          {/* Text area */}
          <div className="px-4 pt-4 pb-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={displayPlaceholder}
              disabled={disabled}
              className={`w-full min-h-[44px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-gray-900 dark:text-gray-100 transition-all ${
                disabled 
                  ? 'placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed' 
                  : 'placeholder-gray-500 dark:placeholder-gray-400'
              }`}
              rows={1}
            />
          </div>

          {/* Bottom controls bar */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            {/* Left side - Attach button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => !disabled && fileInputRef.current?.click()}
              disabled={disabled}
              className="h-8 w-8 text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Right side - Voice/Send buttons */}
            <div className="flex items-center space-x-2">
              {/* Voice record button */}
              <VoiceRecordButton 
                onTranscription={handleTranscription}
                disabled={disabled}
              />
              
              {hasMessage ? (
                <Button
                  type="submit"
                  disabled={disabled || !message.trim()}
                  className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    onClick={() => !disabled && onVoiceModeClick()}
                    disabled={disabled}
                    className="h-8 w-8 transition-all hover:scale-105 text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label="Activar modo de voz"
                    title="Modo de voz conversacional"
                  >
                    <Radio className="h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.xlsx,.xls"
          disabled={disabled}
        />
      </form>
    );
  }

  // Desktop design
  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <div className={`flex items-end space-x-2 bg-white dark:bg-gray-800 border rounded-lg p-3 transition-all ${
        disabled 
          ? 'border-gray-200 dark:border-gray-700 opacity-60' 
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 h-8 w-8 text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={displayPlaceholder}
          disabled={disabled}
          className={`flex-1 min-h-[44px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-gray-900 dark:text-gray-100 transition-all ${
            disabled 
              ? 'placeholder-gray-400 dark:placeholder-gray-500 cursor-not-allowed' 
              : 'placeholder-gray-500 dark:placeholder-gray-400'
          }`}
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
              className="h-11 w-11 bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                onClick={() => !disabled && onVoiceModeClick()}
                disabled={disabled}
                className="h-11 w-11 transition-all hover:scale-105 text-gray-500 hover:text-orange-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        disabled={disabled}
      />
    </form>
  );
});

ChatInput.displayName = 'ChatInput';
