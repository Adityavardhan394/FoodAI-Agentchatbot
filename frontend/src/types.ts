export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface Model {
  name: string;
  size?: string;
  digest?: string;
  modified_at?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  selectedModel: string;
  isLoading: boolean;
  error?: string;
}

export interface ApiResponse {
  content: string;
  done: boolean;
  error?: string;
}

export type Theme = 'light' | 'dark';