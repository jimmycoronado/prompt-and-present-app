
import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length > 0) {
      onFilesUploaded(validFiles);
    }
  }, [onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="mb-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-6 w-6 text-gray-400" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span>Arrastra archivos aquí o </span>
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
              selecciona archivos
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDF, imágenes, Excel, CSV (máx. 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};
