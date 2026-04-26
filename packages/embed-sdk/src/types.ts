export type TracePlayMode = 'lesson' | 'classroom';

export interface TracePlayConfig {
  apiKey: string;
  mode?: TracePlayMode;
  apiUrl?: string;
}

export interface TracePlayOptions {
  width?: string;
  height?: string;
  theme?: 'light' | 'dark';
}
