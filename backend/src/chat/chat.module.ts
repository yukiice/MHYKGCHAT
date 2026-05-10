import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { KeyModule } from '../keys/key.module';
import { SessionModule } from '../session/session.module';
import { PrismaService } from '../prisma/prisma.service';
import { MinMaxAdapter } from '../adapters/minmax.adapter';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, MinMaxAdapter],
  imports: [KeyModule, SessionModule],
})
export class ChatModule {}
