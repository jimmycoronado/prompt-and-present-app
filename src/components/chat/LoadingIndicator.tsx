
import React from "react";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex justify-start animate-fade-in" role="status" aria-live="polite" aria-label="Procesando respuesta">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 max-w-xs">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1" aria-hidden="true">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Consultando agente...</span>
        </div>
      </div>
    </div>
  );
};
