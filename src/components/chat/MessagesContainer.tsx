
import React from "react";
import { ChatMessage as ChatMessageType } from "../../types/chat";
import { PromptTemplate } from "../../types/templates";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";
import { ChatMessage } from "../ChatMessage";
import { useIsMobile } from "../../hooks/use-mobile";

// Definición de las propiedades que recibe el componente MessagesContainer
interface MessagesContainerProps {
  messages: ChatMessageType[];          // Array de mensajes del chat
  selectedMessage: ChatMessageType | null;  // Mensaje actualmente seleccionado (puede ser null)
  onSelectMessage: (message: ChatMessageType | null) => void;  // Función para seleccionar/deseleccionar un mensaje
  isLoading: boolean;                   // Estado de carga para mostrar indicador
  templates: PromptTemplate[];          // Plantillas de prompts disponibles
  onSelectTemplate: (content: string) => void;  // Función que se ejecuta al seleccionar una plantilla
}

/**
 * Componente MessagesContainer
 * 
 * Este es el contenedor principal que muestra todos los mensajes del chat.
 * Maneja dos estados principales:
 * 1. Estado vacío: Cuando no hay mensajes, muestra plantillas para empezar
 * 2. Estado con mensajes: Muestra la lista de mensajes con scroll
 * 
 * También se adapta a dispositivos móviles ajustando el padding inferior
 */
export const MessagesContainer: React.FC<MessagesContainerProps> = React.memo(({
  messages,
  selectedMessage,
  onSelectMessage,
  isLoading,
  templates,
  onSelectTemplate
}) => {
  // Hook para detectar si estamos en un dispositivo móvil
  // Esto nos permite ajustar la interfaz según el tamaño de pantalla
  const isMobile = useIsMobile();
  
  return (
    // Contenedor principal con scroll vertical y padding condicional para móviles
    <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-4' : ''}`}>
      {/* Condicional: Si no hay mensajes, mostrar estado vacío */}
      {messages.length === 0 ? (
        <EmptyState 
          templates={templates}
          onSelectTemplate={onSelectTemplate}
        />
      ) : (
        // Si hay mensajes, mostrar la lista de mensajes
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Mapear cada mensaje y renderizarlo como un componente ChatMessage */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}  // Clave única para React
              message={message}  // Datos del mensaje
              // Determinar si este mensaje está seleccionado comparando IDs
              isSelected={selectedMessage?.id === message.id}
              // Función de click: si ya está seleccionado, deseleccionar (null), sino seleccionar
              onClick={() => onSelectMessage(selectedMessage?.id === message.id ? null : message)}
            />
          ))}
          
          {/* Indicador de carga que aparece al final de los mensajes cuando se está procesando */}
          <LoadingIndicator isLoading={isLoading} />
        </div>
      )}
    </div>
  );
});

// Asignar nombre para debugging en React DevTools
MessagesContainer.displayName = 'MessagesContainer';
