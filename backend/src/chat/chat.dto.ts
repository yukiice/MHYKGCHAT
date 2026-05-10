import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  role: string;

  @ApiProperty({ example: '你好，请帮我写一段代码' })
  @IsString()
  content: string;
}

export class ChatStreamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ example: 'MiniMax-M2.7' })
  @IsNotEmpty()
  model: string;

  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  messages: ChatMessageDto[];
}

export class ChatCompleteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ example: 'MiniMax-M2.7' })
  @IsNotEmpty()
  model: string;

  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  messages: ChatMessageDto[];

  @ApiProperty({ example: 0.7, required: false })
  @IsOptional()
  temperature?: number;

  @ApiProperty({ example: 4096, required: false })
  @IsOptional()
  maxTokens?: number;
}
