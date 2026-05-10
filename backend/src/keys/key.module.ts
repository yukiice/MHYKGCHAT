import { Module } from '@nestjs/common';
import { KeyService } from './key.service';
import { KeyController } from './key.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [KeyController],
  providers: [KeyService, PrismaService],
  exports: [KeyService],
})
export class KeyModule {}
