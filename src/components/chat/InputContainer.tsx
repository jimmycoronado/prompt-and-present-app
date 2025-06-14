import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Mic } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { VoiceRecordButton } from "../VoiceRecordButton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "../ui/badge";

interface InputContainerProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  templateContent: string;
  onTemplateContentChange: (content: string) => void;
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  onVoiceModeClick: () => void;
}

export const InputContainer: React.FC<InputContainerProps> = ({
  onSendMessage,
  isLoading,
  templateContent,
  onTemplateContentChange,
  onFilesSelected,
  uploadedFiles,
  setUploadedFiles,
  onVoiceModeClick
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input, templateContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = templateContent || input;
    if (messageContent.trim() || uploadedFiles.length > 0) {
      onSendMessage(messageContent);
      setInput("");
      onTemplateContentChange("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const displayValue = templateContent || input;
  const hasContent = displayValue.trim().length > 0 || uploadedFiles.length > 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {/* Uploaded files display */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <span className="text-xs truncate max-w-32">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-white"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={templateContent ? "Plantilla cargada - presiona Enter para enviar" : "Escribe tu mensaje..."}
            className="resize-none border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500 dark:focus:ring-orange-500 min-h-[44px] max-h-32 pr-12"
            disabled={isLoading}
            rows={1}
          />
        </div>

        <div className="flex gap-2">
          {/* File upload button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleFileSelect}
            disabled={isLoading}
            className={`${isMobile ? 'h-8 w-8' : 'h-11 w-11'} transition-all hover:scale-105 text-gray-500 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 hover:text-orange-500 hover:bg-gray-50 dark:hover:text-orange-500 dark:hover:bg-gray-700`}
            aria-label="Adjuntar archivo"
            title="Adjuntar archivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Voice record button */}
          <VoiceRecordButton
            onTranscription={(text) => {
              const newText = templateContent ? `${templateContent} ${text}` : (input ? `${input} ${text}` : text);
              if (templateContent) {
                onTemplateContentChange(newText);
              } else {
                setInput(newText);
              }
            }}
            disabled={isLoading}
          />

          {/* Voice mode button - Fixed styling to match microphone button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onVoiceModeClick}
            disabled={isLoading}
            className={`${isMobile ? 'h-8 w-8' : 'h-11 w-11'} transition-all hover:scale-105 text-gray-500 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 hover:text-orange-500 hover:bg-gray-50 dark:hover:text-orange-500 dark:hover:bg-gray-700`}
            aria-label="Modo de voz"
            title="Activar modo de voz"
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            type="submit"
            disabled={!hasContent || isLoading}
            className={`${isMobile ? 'h-8 w-8' : 'h-11 w-11'} bg-skandia-green hover:bg-skandia-green/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all hover:scale-105`}
            aria-label="Enviar mensaje"
            title="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </form>
    </div>
  );
};
