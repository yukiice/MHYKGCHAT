import { Controller, Get, Post, Headers, Body, Req, Sse, HttpCode } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatStreamDto, ChatCompleteDto } from './chat.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@ApiTags('聊天')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('models')
  @ApiOperation({ summary: '获取可用模型列表' })
  async listModels() {
    return this.chatService.listModels();
  }

  @Sse('stream')
  @HttpCode(200)
  @ApiOperation({ summary: '流式聊天 (SSE)' })
  @ApiHeader({ name: 'Authorization', required: false, description: 'Bearer JWT Token' })
  @ApiHeader({ name: 'x-api-key', required: false, description: 'API Key' })
  async streamChat(
    @Body() body: ChatStreamDto,
    @Headers('authorization') auth: string,
    @Headers('x-api-key') apiKey: string,
    @Req() req: any,
  ) {
    const token = auth?.replace('Bearer ', '');
    let userId: string | undefined;

    if (token) {
      try {
        userId = req.user?.sub;
      } catch {}
    }

    const effectiveApiKey = apiKey || token;

    const subject = new Subject<any>();

    (async () => {
      try {
        const stream = await this.chatService.streamChat(
          body.messages,
          body.model,
          effectiveApiKey,
          userId,
        );

        for await (const chunk of stream) {
          subject.next({
            data: JSON.stringify({ content: chunk }),
          });
        }
        subject.next({ data: '[DONE]' });
      } catch (error) {
        subject.next({
          data: JSON.stringify({ error: error.message }),
        });
      } finally {
        subject.complete();
      }
    })();

    return subject.asObservable().pipe(
      map((event) => ({
        ...event,
        type: event.type,
      })),
    );
  }

  @Post('complete')
  @HttpCode(200)
  @ApiOperation({ summary: '同步聊天' })
  async completeChat(
    @Body() body: ChatCompleteDto,
    @Headers('authorization') auth: string,
    @Headers('x-api-key') apiKey: string,
    @Req() req: any,
  ) {
    const token = auth?.replace('Bearer ', '');
    let userId: string | undefined;

    if (token) {
      try {
        userId = req.user?.sub;
      } catch {}
    }

    const effectiveApiKey = apiKey || token;

    return this.chatService.complete(
      body.messages,
      body.model,
      effectiveApiKey,
      userId,
    );
  }
}
