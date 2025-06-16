
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Array<{
    name: string;
    size: number;
    type: string;
    url?: string; // Añadido para URLs de archivos de Azure
  }>;
  data?: Array<Record<string, any>>;
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    data: Array<Record<string, any>>;
    xAxis?: string;
    yAxis?: string;
  };
  downloadLink?: {
    url: string;
    filename: string;
  };
  videoPreview?: {
    url: string;
    title: string;
    thumbnail?: string;
  };
  metadata?: {
    processingTime: number;
    model: string;
    tokensUsed: number;
  };
}
