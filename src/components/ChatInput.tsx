import { useState, useRef, useEffect } from "react";
import { Send, File, Paperclip } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { VoiceRecordButton } from "./VoiceRecordButton";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  onFilesSelected?: (files: File[]) => void;
  uploadedFiles?: File[];
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled, 
  initialValue = "",
  onValueChange,
  onFilesSelected,
  uploadedFiles = []
}) => {
  const [message, setMessage] = useState(initialValue);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastInitialValueRef = useRef(initialValue);

  const hasFiles = uploadedFiles.length > 0;

  useEffect(() => {
    // Only update if initialValue actually changed and is different from current message
    if (initialValue !== lastInitialValueRef.current && initialValue !== message) {
      console.log('ChatInput: Setting message from initialValue:', initialValue);
      setMessage(initialValue);
      lastInitialValueRef.current = initialValue;
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        if (initialValue) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }
    }
  }, [initialValue, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    console.log('ChatInput: Submitting message:', trimmedMessage);
    
    if ((trimmedMessage || hasFiles) && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
      lastInitialValueRef.current = "";
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
    console.log('ChatInput: Input changed:', value);
    setMessage(value);
    onValueChange?.(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    console.log('ChatInput: Voice transcription received:', transcribedText);
    const newMessage = message + (message ? ' ' : '') + transcribedText;
    setMessage(newMessage);
    onValueChange?.(newMessage);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });
    
    if (validFiles.length > 0) {
      onFilesSelected?.(validFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!disabled) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  // Paste handler for Ctrl+V
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || disabled) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault(); // Prevent default paste behavior for files
      const fileList = new DataTransfer();
      files.forEach(file => fileList.items.add(file));
      validateAndProcessFiles(fileList.files);
    }
  };

  const hasTemplateVariables = message.includes('{') && message.includes('}');

  return (
    <form onSubmit={handleSubmit} className="relative" role="search" aria-label="Enviar mensaje">
      <div className="flex items-end space-x-2">
        {/* File Upload Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileButtonClick}
          disabled={disabled}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-11 w-11 flex-shrink-0"
          aria-label="Adjuntar archivo"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
          className="hidden"
        />
        
        <div 
          className={`flex-1 relative transition-all duration-200 ${
            isDragOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
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
              <File className="h-4 w-4 text-orange-500" />
            </div>
          )}
        </div>
        
        <VoiceRecordButton
          onTranscription={handleVoiceTranscription}
          disabled={disabled}
        />
        
        <Button
          type="submit"
          disabled={(!message.trim() && !hasFiles) || disabled}
          size="icon"
          className="bg-skandia-green hover:bg-skandia-green/90 text-white rounded-lg h-11 w-11 transition-all hover:scale-105"
          aria-label="Enviar mensaje"
          id="send-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {hasTemplateVariables && (
        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center">
          <File className="h-3 w-3 mr-1" />
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
