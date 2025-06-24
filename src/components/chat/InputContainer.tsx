
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { ChatInput, ChatInputRef } from "../ChatInput";
import { useIsMobile } from "../../hooks/use-mobile";

// Propiedades que recibe el componente InputContainer
interface InputContainerProps {
  onSendMessage: (content: string) => void;      // Función para enviar un mensaje
  isLoading: boolean;                            // Estado de carga del chat
  templateContent: string;                       // Contenido de plantilla predefinido
  onTemplateContentChange: (content: string) => void;  // Función para cambiar el contenido de plantilla
  onFilesSelected: (files: File[]) => void;      // Función cuando se seleccionan archivos
  uploadedFiles: File[];                         // Array de archivos ya subidos
  setUploadedFiles: (files: File[] | ((prev: File[]) => File[])) => void;  // Función para modificar archivos subidos
  onVoiceModeClick?: () => void;                 // Función opcional para modo de voz
  onRequestLocation?: () => void;                // Función opcional para solicitar ubicación
  isLoadingLocation?: boolean;                   // Estado de carga de ubicación
}

// Interfaz para las funciones que este componente expone hacia afuera (ref)
export interface InputContainerRef {
  sendBannerMessage: (automaticReply: string) => void;  // Permite enviar mensajes desde componentes padre
}

/**
 * Componente InputContainer
 * 
 * Este es el contenedor principal del área de entrada del chat. Sus responsabilidades incluyen:
 * 
 * 1. Mostrar archivos subidos con opción de removerlos
 * 2. Contener el input principal del chat
 * 3. Adaptarse a dispositivos móviles (posición fija en bottom)
 * 4. Exponer funciones hacia arriba mediante useImperativeHandle
 * 
 * El componente usa forwardRef para permitir que componentes padre accedan
 * a funciones internas como sendBannerMessage
 */
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
  // Hook para detectar si estamos en dispositivo móvil
  const isMobile = useIsMobile();
  
  // Referencia al componente ChatInput para acceder a sus funciones
  const chatInputRef = useRef<ChatInputRef>(null);

  /**
   * useImperativeHandle permite exponer funciones específicas del componente
   * hacia el componente padre que usa este componente mediante ref
   * 
   * En este caso, exponemos sendBannerMessage para que desde arriba
   * puedan enviar mensajes automáticos (como respuestas de banners)
   */
  useImperativeHandle(ref, () => ({
    sendBannerMessage: (automaticReply: string) => {
      // Llamar a la función sendBannerMessage del ChatInput interno
      chatInputRef.current?.sendBannerMessage(automaticReply);
    }
  }));

  return (
    // Contenedor principal - cambia entre fijo en bottom (móvil) y normal (desktop)
    <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-40 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700' : 'flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
      
      {/* Área de archivos subidos - solo se muestra si hay archivos */}
      {uploadedFiles.length > 0 && (
        <div className="p-4 pb-2 animate-fade-in" aria-label="Archivos seleccionados">
          <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
            {/* Mapear cada archivo subido y mostrarlo como una "pill" */}
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2 animate-scale-in"
              >
                {/* Nombre del archivo */}
                <span>{file.name}</span>
                
                {/* Botón para remover el archivo */}
                <button
                  onClick={() => !isLoading && setUploadedFiles(files => files.filter((_, i) => i !== index))}
                  disabled={isLoading}  // Deshabilitado durante carga
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

      {/* Área del input principal */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Componente ChatInput con todas las propiedades pasadas */}
          <ChatInput 
            ref={chatInputRef}  // Referencia para acceder a funciones internas
            onSendMessage={onSendMessage} 
            disabled={isLoading}  // Deshabilitar durante carga
            initialValue={templateContent}  // Valor inicial desde plantilla
            onValueChange={onTemplateContentChange}  // Callback cuando cambia el contenido
            onFilesSelected={onFilesSelected}  // Callback cuando se seleccionan archivos
            uploadedFiles={uploadedFiles}  // Archivos ya subidos
            onVoiceModeClick={onVoiceModeClick}  // Callback para modo de voz
          />
        </div>
      </div>
    </div>
  );
});

// Nombre para debugging en React DevTools
InputContainer.displayName = 'InputContainer';
