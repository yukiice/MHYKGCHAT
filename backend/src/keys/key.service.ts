import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, randomBytes } from 'crypto';
import { CreateKeyDto, UpdateKeyDto } from './key.dto';

@Injectable()
export class KeyService {
  constructor(private prisma: PrismaService) {}

  async createKey(userId: string, dto: CreateKeyDto) {
    const rawKey = `sk_${randomBytes(32).toString('hex')}`;
    const hashedKey = createHash('sha256').update(rawKey).digest('hex');

    const key = await this.prisma.apiKey.create({
      data: {
        key: hashedKey,
        name: dto.name,
        quota: dto.quota || 0,
        userId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return {
      ...key,
      key: rawKey,
    };
  }

  async getKeys(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      quota: k.quota,
      used: k.used,
      expiresAt: k.expiresAt,
      isActive: k.isActive,
      createdAt: k.createdAt,
    }));
  }

  async updateKey(userId: string, keyId: string, dto: UpdateKeyDto) {
    const key = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    if (key.userId !== userId) {
      throw new ForbiddenException('Not your API Key');
    }

    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: {
        name: dto.name,
        quota: dto.quota,
        isActive: dto.isActive,
      },
    });
  }

  async deleteKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    if (key.userId !== userId) {
      throw new ForbiddenException('Not your API Key');
    }

    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });

    return { deleted: true };
  }

  async validateKey(rawKey: string) {
    const hashedKey = createHash('sha256').update(rawKey).digest('hex');

    const key = await this.prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: { user: true },
    });

    if (!key || !key.isActive) return null;
    if (key.expiresAt && key.expiresAt < new Date()) return null;
    if (key.quota > 0 && key.used >= key.quota) return null;

    return key;
  }

  async incrementUsage(keyId: string) {
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { used: { increment: 1 } },
    });
  }

  async getKeyUsage(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    if (key.userId !== userId) {
      throw new ForbiddenException('Not your API Key');
    }

    return {
      key: {
        id: key.id,
        name: key.name,
        quota: key.quota,
        used: key.used,
      },
      logs: key.logs,
    };
  }
}
