
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface DataTableProps {
  data: {
    headers: string[];
    rows: (string | number)[][];
  };
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  
  const totalPages = Math.ceil(data.rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = data.rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const exportToCSV = () => {
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
    <div className="w-full max-w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header with title and export button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Tabla {data.headers.length}x{data.rows.length}
          </h3>
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

      {/* Scrollable table container */}
      <div className="relative w-full">
        <ScrollArea className="h-[400px] w-full overflow-auto">
          <Table className="w-max" style={{ minWidth: `${data.headers.length * 150}px` }}>
            <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
              <TableRow>
                {data.headers.map((header, index) => (
                  <TableHead
                    key={index}
                    className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                    style={{ width: '150px', minWidth: '150px' }}
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {header}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.map((row, rowIndex) => (
                <TableRow
                  key={startIndex + rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                      style={{ width: '150px', minWidth: '150px' }}
                      title={String(cell)}
                    >
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {cell}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, data.rows.length)} de {data.rows.length} filas
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
  );
};
