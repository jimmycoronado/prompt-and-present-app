
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

interface DataTableProps {
  data: Array<Record<string, any>> | {
    headers: string[];
    rows: (string | number)[][];
  };
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const rowsPerPage = 10;
  
  // Convert array of objects to headers/rows format if needed
  const tableData = React.useMemo(() => {
    if (Array.isArray(data)) {
      if (data.length === 0) return { headers: [], rows: [] };
      
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => item[header]));
      return { headers, rows };
    }
    return data;
  }, [data]);
  
  const totalPages = Math.ceil(tableData.rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = tableData.rows.slice(startIndex, endIndex);

  // Determinar si es una tabla grande que necesita ser colapsable
  const isLargeTable = tableData.headers.length > 5 || tableData.rows.length > 10;

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const exportToCSV = () => {
    const csvContent = [
      tableData.headers.join(','),
      ...tableData.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tabla_datos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-table-wrapper my-4 w-full">
      {/* Header with title, stats, and controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tabla de Datos
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
            {tableData.headers.length} columnas • {tableData.rows.length} filas
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isLargeTable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={exportToCSV}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible table content */}
      {!isCollapsed && (
        <>
          {/* Scrollable table container */}
          <div className="scrollable-table">
            <div className="overflow-x-auto border-l border-r border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
              <table className="dataframe-table">
                <thead>
                  <tr>
                    {tableData.headers.map((header, index) => (
                      <th key={index} className="dataframe-header">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row, rowIndex) => (
                    <tr
                      key={startIndex + rowIndex}
                      className="dataframe-row"
                    >
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="dataframe-cell">
                          <div className="cell-content" title={String(cell)}>
                            {cell}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border border-t-0 border-gray-200 dark:border-gray-600 rounded-b-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1}-{Math.min(endIndex, tableData.rows.length)} de {tableData.rows.length} filas
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="text-gray-600 dark:text-gray-400 disabled:opacity-50"
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Collapsed state */}
      {isCollapsed && (
        <div className="p-4 border border-t-0 border-gray-200 dark:border-gray-600 rounded-b-lg bg-gray-50 dark:bg-gray-700/50 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Tabla contraída • Click para expandir
          </span>
        </div>
      )}
    </div>
  );
};
