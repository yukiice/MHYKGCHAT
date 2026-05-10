import { Injectable } from '@nestjs/common';
import { BaseAdapter, CompletionOptions, ModelInfo } from './base.adapter';
import OpenAI from 'openai';

@Injectable()
export class MinMaxAdapter extends BaseAdapter {
  provider = 'minmax';
  baseUrl = process.env.MINMAX_BASE_URL || 'https://api.minimaxi.com/v1';
  apiKey: string;
  client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async *stream(options: CompletionOptions): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages as any,
      stream: true,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    } as any);

    let reasoningBuffer = '';
    let textBuffer = '';

    const iterator = stream as any;
    for await (const chunk of iterator) {
      const delta = chunk.choices[0]?.delta as any;

      if (delta?.reasoning_details) {
        for (const detail of delta.reasoning_details) {
          if (detail.type === 'text' && 'text' in detail) {
            const reasoningText = detail.text as string;
            const newReasoning = reasoningText.slice(reasoningBuffer.length);
            if (newReasoning) {
              yield `[THINKING]${newReasoning}[/THINKING]`;
              reasoningBuffer = reasoningText;
            }
          }
        }
      }

      if (delta?.content) {
        const contentText = delta.content;
        const newText = textBuffer ? contentText.slice(textBuffer.length) : contentText;
        if (newText) {
          yield newText;
          textBuffer = contentText;
        }
      }
    }
  }

  async complete(options: CompletionOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages as any,
      stream: false,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    } as any);

    const message = response.choices[0]?.message as any;
    let text = '';

    if (message?.reasoning_details?.[0]?.text) {
      text += `[THINKING]${message.reasoning_details[0].text}[/THINKING]\n\n`;
    }

    if (message?.content) {
      text += message.content;
    }

    return text;
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'MiniMax-M2.7', name: 'MiniMax M2.7 (标准)', provider: 'minmax', supportsStreaming: true },
      { id: 'MiniMax-M2.7-highspeed', name: 'MiniMax M2.7 (极速)', provider: 'minmax', supportsStreaming: true },
      { id: 'MiniMax-M2.5', name: 'MiniMax M2.5 (标准)', provider: 'minmax', supportsStreaming: true },
      { id: 'MiniMax-M2.5-highspeed', name: 'MiniMax M2.5 (极速)', provider: 'minmax', supportsStreaming: true },
      { id: 'MiniMax-M2.1', name: 'MiniMax M2.1', provider: 'minmax', supportsStreaming: true },
      { id: 'MiniMax-M2.1-highspeed', name: 'MiniMax M2.1 (极速)', provider: 'minmax', supportsStreaming: true },
    ];
  }
}
