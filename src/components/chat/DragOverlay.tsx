
import { File } from "lucide-react";

interface DragOverlayProps {
  isDragOver: boolean;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({ isDragOver }) => {
  if (!isDragOver) return null;

  return (
    <div className="fixed inset-0 z-50 bg-blue-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border-2 border-dashed border-blue-400">
        <div className="text-center">
          <File className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Suelta los archivos aquí
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            PDF, imágenes, Excel o CSV (máximo 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};
