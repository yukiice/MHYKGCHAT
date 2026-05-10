import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, PrismaService, RedisService],
  exports: [SessionService],
})
export class SessionModule {}
