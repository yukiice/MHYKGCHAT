import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      include: {
        logs: true,
      },
    });

    const summary = keys.map((key) => ({
      keyId: key.id,
      keyName: key.name,
      quota: key.quota,
      used: key.used,
      totalInputTokens: key.logs.reduce((sum, log) => sum + log.inputTokens, 0),
      totalOutputTokens: key.logs.reduce((sum, log) => sum + log.outputTokens, 0),
      totalCost: key.logs.reduce((sum, log) => sum + log.cost, 0),
    }));

    return {
      keys: summary,
      totalUsed: summary.reduce((sum, k) => sum + k.used, 0),
      totalInputTokens: summary.reduce((sum, k) => sum + k.totalInputTokens, 0),
      totalOutputTokens: summary.reduce((sum, k) => sum + k.totalOutputTokens, 0),
    };
  }

  async getLogs(userId: string, keyId?: string, limit = 100, offset = 0) {
    const where: any = {};

    if (keyId) {
      const key = await this.prisma.apiKey.findUnique({ where: { id: keyId } });
      if (!key || key.userId !== userId) {
        return { logs: [], total: 0 };
      }
      where.apiKeyId = keyId;
    } else {
      where.apiKey = { userId };
    }

    const [logs, total] = await Promise.all([
      this.prisma.usageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          apiKey: { select: { name: true } },
        },
      }),
      this.prisma.usageLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        keyName: log.apiKey.name,
        model: log.model,
        inputTokens: log.inputTokens,
        outputTokens: log.outputTokens,
        cost: log.cost,
        createdAt: log.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  async getUsageByKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!key || key.userId !== userId) {
      return null;
    }

    return {
      keyId: key.id,
      keyName: key.name,
      quota: key.quota,
      used: key.used,
      logs: key.logs,
    };
  }
}
