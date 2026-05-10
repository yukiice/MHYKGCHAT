export interface CompletionOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  supportsStreaming: boolean;
}

export abstract class BaseAdapter {
  abstract provider: string;
  abstract baseUrl: string;
  abstract apiKey: string;

  abstract complete(options: CompletionOptions): Promise<string>;

  abstract stream(options: CompletionOptions): AsyncGenerator<string>;

  abstract listModels(): Promise<ModelInfo[]>;

  calculateCost(inputTokens: number, outputTokens: number): number {
    return 0;
  }
}
