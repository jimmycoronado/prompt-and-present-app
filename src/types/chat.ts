
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
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'treemap' | 'funnel' | 'composed' | 'sankey';
  data: Array<{ [key: string]: string | number }>;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
  title?: string;
  // Additional keys for complex charts
  yKey2?: string; // For composed charts
  radarKeys?: string[]; // For radar charts
  sankeyNodes?: Array<{ name: string }>;
  sankeyLinks?: Array<{ source: number; target: number; value: number }>;
}

export interface DownloadLink {
  url: string;
  filename: string;
}

export interface VideoPreview {
  url: string;
  title: string;
  thumbnail: string;
  duration?: string;
  platform: 'youtube' | 'vimeo' | 'generic';
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
  videoPreview?: VideoPreview;
  metadata?: MessageMetadata;
}
