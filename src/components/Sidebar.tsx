
import { X, Clock, Cpu, Hash, Calendar, FileText, BarChart3, Download } from "lucide-react";
import { Button } from "./ui/button";
import { ChatMessage } from "../types/chat";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMessage: ChatMessage | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedMessage }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 lg:relative lg:top-0 lg:h-full transform transition-transform lg:translate-x-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalles Técnicos
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto h-full">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Message Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Información del Mensaje
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">ID:</span>
                    <span className="text-gray-900 dark:text-white font-mono">
                      {selectedMessage.id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {selectedMessage.type === 'user' ? 'Usuario' : 'Asistente'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Hora:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedMessage.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata for AI messages */}
              {selectedMessage.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Cpu className="h-4 w-4 mr-2" />
                    Metadatos de Procesamiento
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Modelo:</span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {selectedMessage.metadata.model}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tiempo:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedMessage.metadata.processingTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tokens:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedMessage.metadata.tokensUsed}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Files info */}
              {selectedMessage.files && selectedMessage.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Archivos Adjuntos
                  </h3>
                  <div className="space-y-2">
                    {selectedMessage.files.map((file, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Tipo: {file.type}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data info */}
              {selectedMessage.data && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    Datos de Tabla
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Columnas:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedMessage.data.headers.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Filas:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedMessage.data.rows.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart info */}
              {selectedMessage.chart && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Información de Gráfica
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {selectedMessage.chart.type === 'bar' ? 'Barras' : 'Líneas'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Puntos:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedMessage.chart.data.length}
                      </span>
                    </div>
                    {selectedMessage.chart.title && (
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Título:</span>
                        <div className="text-gray-900 dark:text-white mt-1">
                          {selectedMessage.chart.title}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download info */}
              {selectedMessage.downloadLink && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Descarga Disponible
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMessage.downloadLink.filename}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      <a href={selectedMessage.downloadLink.url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <FileText className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Selecciona un mensaje para ver los detalles técnicos
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
