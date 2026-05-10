import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { KeyModule } from './keys/key.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { UsageModule } from './usage/usage.module';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MinMaxAdapter } from './adapters/minmax.adapter';

@Module({
  imports: [
    AuthModule,
    KeyModule,
    SessionModule,
    ChatModule,
    UsageModule,
  ],
  providers: [PrismaService, RedisService, MinMaxAdapter],
})
export class AppModule {}
