
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
  const rowsPerPage = 10; // Reducimos a 10 filas por página para mejor UX
  
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

  // Determinar si necesitamos colapsar por defecto (tablas muy grandes)
  const shouldCollapse = tableData.headers.length > 5 || tableData.rows.length > 20;
  const needsHorizontalScroll = tableData.headers.length > 3;

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
    <div className="chat-table-wrapper w-full my-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {/* Header with title, collapse button and export button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tabla {tableData.headers.length}x{tableData.rows.length}
            </h3>
            {shouldCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportToCSV}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Table container - colapsable para tablas grandes */}
        {(!shouldCollapse || !isCollapsed) && (
          <div className="scrollable-table">
            <div className={`max-h-[400px] overflow-y-auto ${needsHorizontalScroll ? 'overflow-x-auto' : ''}`}>
              <div className={needsHorizontalScroll ? 'min-w-max' : 'w-full'}>
                <table className="w-full text-sm dataframe-table">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
                    <tr>
                      {tableData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="dataframe-header"
                          style={needsHorizontalScroll ? { minWidth: '150px' } : {}}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {currentRows.map((row, rowIndex) => (
                      <tr
                        key={startIndex + rowIndex}
                        className="dataframe-row"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="dataframe-cell"
                            style={needsHorizontalScroll ? { minWidth: '150px' } : {}}
                            title={String(cell)}
                          >
                            <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
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
          </div>
        )}

        {/* Collapsed state preview */}
        {shouldCollapse && isCollapsed && (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Tabla con {tableData.headers.length} columnas y {tableData.rows.length} filas
            </p>
            <p className="text-xs mt-1">Haz clic en ↓ para expandir</p>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (!shouldCollapse || !isCollapsed) && (
          <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {startIndex + 1}-{Math.min(endIndex, tableData.rows.length)} de {tableData.rows.length} filas
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
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
