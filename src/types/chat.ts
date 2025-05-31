
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: Array<{ [key: string]: string | number }>;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
  title?: string;
}

export interface DownloadLink {
  url: string;
  filename: string;
}

export interface MessageMetadata {
  processingTime: number;
  model: string;
  tokensUsed: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileInfo[];
  data?: TableData;
  chart?: ChartData;
  downloadLink?: DownloadLink;
  metadata?: MessageMetadata;
}
