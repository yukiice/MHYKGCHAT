import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MinMaxAdapter } from '../adapters/minmax.adapter';
import { KeyService } from '../keys/key.service';
import { SessionService } from '../session/session.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompletionOptions } from '../adapters/base.adapter';

@Injectable()
export class ChatService {
  private adapter: MinMaxAdapter;
  private minmaxApiKey: string;

  constructor(
    private keyService: KeyService,
    private sessionService: SessionService,
    private prisma: PrismaService,
  ) {
    this.adapter = new MinMaxAdapter();
    this.minmaxApiKey = process.env.MINMAX_API_KEY || '';
  }

  async streamChat(
    messages: Array<{ role: string; content: string }>,
    model: string,
    apiKey: string,
    userId?: string,
  ) {
    const validKey = await this.keyService.validateKey(apiKey);
    if (!validKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const effectiveUserId = userId || validKey.userId;

    // Use MINMAX_API_KEY for actual API call, user's API key is for auth only
    this.adapter.setApiKey(this.minmaxApiKey);

    const options: CompletionOptions = {
      model,
      messages,
      stream: true,
    };

    return this.streamResponse(options, validKey.id, effectiveUserId);
  }

  async *streamResponse(
    options: CompletionOptions,
    keyId: string,
    userId: string,
  ): AsyncGenerator<string> {
    let fullContent = '';
    let reasoningContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      for await (const chunk of this.adapter.stream(options)) {
        if (chunk.startsWith('[THINKING]')) {
          reasoningContent += chunk.slice(11, -12);
        } else {
          fullContent += chunk;
          outputTokens++;
        }
        yield chunk;
      }

      await this.keyService.incrementUsage(keyId);

      await this.prisma.usageLog.create({
        data: {
          apiKeyId: keyId,
          model: options.model,
          inputTokens,
          outputTokens,
          cost: 0,
          metadata: { reasoningLength: reasoningContent.length },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async complete(
    messages: Array<{ role: string; content: string }>,
    model: string,
    apiKey: string,
    userId?: string,
  ) {
    const validKey = await this.keyService.validateKey(apiKey);
    if (!validKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const effectiveUserId = userId || validKey.userId;

    // Use MINMAX_API_KEY for actual API call
    this.adapter.setApiKey(this.minmaxApiKey);

    const options: CompletionOptions = {
      model,
      messages,
      stream: false,
    };

    const response = await this.adapter.complete(options);

    await this.keyService.incrementUsage(validKey.id);

    return { content: response };
  }

  async listModels() {
    return this.adapter.listModels();
  }
}
