
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { ChatInput, ChatInputRef } from "../ChatInput";
import { useIsMobile } from "../../hooks/use-mobile";

interface InputContainerProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  templateContent: string;
  onTemplateContentChange: (content: string) => void;
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  onVoiceModeClick?: () => void;
  onRequestLocation?: () => void;
  isLoadingLocation?: boolean;
}

export interface InputContainerRef {
  sendBannerMessage: (automaticReply: string) => void;
}

export const InputContainer = forwardRef<InputContainerRef, InputContainerProps>(({
  onSendMessage,
  isLoading,
  templateContent,
  onTemplateContentChange,
  onFilesSelected,
  uploadedFiles,
  setUploadedFiles,
  onVoiceModeClick,
  onRequestLocation,
  isLoadingLocation
}, ref) => {
  const isMobile = useIsMobile();
  const chatInputRef = useRef<ChatInputRef>(null);

  // Expose the sendBannerMessage method to parent components
  useImperativeHandle(ref, () => ({
    sendBannerMessage: (automaticReply: string) => {
      chatInputRef.current?.sendBannerMessage(automaticReply);
    }
  }));

  return (
    <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-40 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700' : 'flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <div className="p-4 pb-2 animate-fade-in" aria-label="Archivos seleccionados">
          <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2 animate-scale-in"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => !isLoading && setUploadedFiles(files => files.filter((_, i) => i !== index))}
                  disabled={isLoading}
                  className="text-orange-500 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remover archivo ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            ref={chatInputRef}
            onSendMessage={onSendMessage} 
            disabled={isLoading}
            initialValue={templateContent}
            onValueChange={onTemplateContentChange}
            onFilesSelected={onFilesSelected}
            uploadedFiles={uploadedFiles}
            onVoiceModeClick={onVoiceModeClick}
          />
        </div>
      </div>
    </div>
  );
});

InputContainer.displayName = 'InputContainer';
