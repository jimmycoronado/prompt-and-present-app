
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

// Definición de tipos: la tabla puede recibir datos en dos formatos diferentes
interface DataTableProps {
  data: Array<Record<string, any>> | {  // Formato 1: Array de objetos
    headers: string[];                   // Formato 2: Objeto con headers y rows separados
    rows: (string | number)[][];
  };
}

/**
 * Componente DataTable
 * 
 * Este componente renderiza tablas de datos de manera inteligente con las siguientes características:
 * - Paginación automática para tablas grandes
 * - Capacidad de colapsar tablas muy grandes para mejorar rendimiento
 * - Exportación a CSV
 * - Responsive design con scroll horizontal
 * - Soporte para modo oscuro
 * 
 * Recibe datos en dos formatos posibles y los normaliza internamente
 */
export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  // Estados del componente
  const [currentPage, setCurrentPage] = useState(1);      // Página actual para paginación
  const [isCollapsed, setIsCollapsed] = useState(false);  // Estado de colapso para tablas grandes
  const rowsPerPage = 10;  // Número fijo de filas por página
  
  /**
   * Memo para convertir y normalizar los datos
   * 
   * Los datos pueden venir en dos formatos:
   * 1. Array de objetos: [{nombre: "Juan", edad: 25}, {nombre: "Ana", edad: 30}]
   * 2. Objeto estructurado: {headers: ["nombre", "edad"], rows: [["Juan", 25], ["Ana", 30]]}
   * 
   * Este memo convierte todo al formato 2 para procesamiento uniforme
   */
  const tableData = React.useMemo(() => {
    // Si recibimos un array de objetos (formato 1)
    if (Array.isArray(data)) {
      // Caso especial: array vacío
      if (data.length === 0) return { headers: [], rows: [] };
      
      // Extraer las claves del primer objeto como headers
      const headers = Object.keys(data[0]);
      // Convertir cada objeto en un array de valores siguiendo el orden de los headers
      const rows = data.map(item => headers.map(header => item[header]));
      return { headers, rows };
    }
    // Si ya viene en formato 2, usar directamente
    return data;
  }, [data]);  // Re-ejecutar solo cuando cambien los datos
  
  // Cálculos para paginación
  const totalPages = Math.ceil(tableData.rows.length / rowsPerPage);  // Total de páginas
  const startIndex = (currentPage - 1) * rowsPerPage;  // Índice de inicio para página actual
  const endIndex = startIndex + rowsPerPage;           // Índice de fin para página actual
  const currentRows = tableData.rows.slice(startIndex, endIndex);  // Filas a mostrar en página actual

  /**
   * Lógica para determinar si la tabla debe poder colapsarse
   * 
   * Consideramos que una tabla es "grande" si:
   * - Tiene más de 4 columnas, O
   * - Tiene más de 15 filas
   * 
   * Las tablas grandes pueden afectar el rendimiento, por eso ofrecemos la opción de colapsar
   */
  const shouldCollapse = tableData.headers.length > 4 || tableData.rows.length > 15;

  // Función para navegar a la página anterior
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));  // No bajar de página 1
  };

  // Función para navegar a la página siguiente
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));  // No subir del total de páginas
  };

  /**
   * Función para exportar la tabla completa a formato CSV
   * 
   * Proceso:
   * 1. Crear primera línea con headers separados por comas
   * 2. Agregar cada fila con valores entre comillas para evitar problemas con comas en los datos
   * 3. Unir todo con saltos de línea
   * 4. Crear un blob (archivo temporal en memoria)
   * 5. Simular click en link de descarga
   * 6. Limpiar recursos
   */
  const exportToCSV = () => {
    const csvContent = [
      tableData.headers.join(','),  // Primera línea: headers
      // Resto de líneas: cada fila con valores entre comillas
      ...tableData.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');  // Unir todo con saltos de línea
    
    // Crear archivo temporal en memoria del navegador
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    // Crear enlace temporal y simular click para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tabla_datos.csv';  // Nombre del archivo
    document.body.appendChild(link);    // Agregar al DOM temporalmente
    link.click();                       // Simular click
    document.body.removeChild(link);    // Remover del DOM
    window.URL.revokeObjectURL(url);    // Liberar memoria
  };

  return (
    // Contenedor principal de la tabla con clases para chat
    <div className="chat-table-wrapper w-full my-4">
      {/* Contenedor con bordes redondeados y sombra */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        
        {/* Header de la tabla con título, botón de colapso y botón de exportación */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {/* Lado izquierdo: título y botón de colapso */}
          <div className="flex items-center space-x-2">
            {/* Título que muestra las dimensiones de la tabla */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tabla {tableData.headers.length}×{tableData.rows.length}
            </h3>
            {/* Botón de colapso: solo se muestra si la tabla es grande */}
            {shouldCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}  // Alternar estado de colapso
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {/* Icono cambia según el estado: flecha hacia abajo si está colapsado, hacia arriba si está expandido */}
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                <span className="ml-1 text-xs">
                  {isCollapsed ? 'Expandir' : 'Contraer'}
                </span>
              </Button>
            )}
          </div>
          
          {/* Lado derecho: botón de exportación */}
          <Button
            variant="ghost"
            size="sm"
            onClick={exportToCSV}  // Llamar función de exportación
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenedor de la tabla - solo se muestra si no debe colapsar O si está expandida */}
        {(!shouldCollapse || !isCollapsed) && (
          <div className="w-full overflow-x-auto">  {/* Scroll horizontal para tablas anchas */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 whitespace-nowrap">
              {/* Encabezado de la tabla */}
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {/* Renderizar cada header */}
                  {tableData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[120px]"
                      title={header}  // Tooltip con el nombre completo del header
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Cuerpo de la tabla */}
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Renderizar solo las filas de la página actual */}
                {currentRows.map((row, rowIndex) => (
                  <tr
                    key={startIndex + rowIndex}  // Key única considerando la paginación
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"  // Efecto hover
                  >
                    {/* Renderizar cada celda de la fila */}
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-[250px] truncate"
                        title={String(cell)}  // Tooltip con el valor completo en caso de truncamiento
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vista previa cuando la tabla está colapsada */}
        {shouldCollapse && isCollapsed && (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Tabla con {tableData.headers.length} columnas y {tableData.rows.length} filas
            </p>
            <p className="text-xs mt-1">Haz clic en "Expandir" para ver el contenido</p>
          </div>
        )}

        {/* Controles de paginación - solo se muestran si hay más de 1 página Y la tabla no está colapsada */}
        {totalPages > 1 && (!shouldCollapse || !isCollapsed) && (
          <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            {/* Información de paginación: "Mostrando X-Y de Z filas" */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {startIndex + 1}-{Math.min(endIndex, tableData.rows.length)} de {tableData.rows.length} filas
            </div>
            
            {/* Controles de navegación */}
            <div className="flex items-center space-x-2">
              {/* Botón página anterior */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}  // Deshabilitado si estamos en la primera página
                className="text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Indicador de página actual */}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentPage} de {totalPages}
              </span>
              
              {/* Botón página siguiente */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}  // Deshabilitado si estamos en la última página
                className="text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
