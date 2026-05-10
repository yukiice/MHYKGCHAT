import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const session = await this.prisma.session.create({
      data: {
        userId,
        title: dto.title,
      },
    });

    await this.redis.set(
      `session:${session.id}`,
      JSON.stringify({ id: session.id, title: session.title }),
      60 * 60 * 24 * 7,
    );

    return session;
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getSession(userId: string, sessionId: string) {
    const cached = await this.redis.get(`session:${sessionId}`);
    if (cached) {
      const session = JSON.parse(cached);
      return { ...session, messages: [] };
    }

    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.redis.set(
      `session:${session.id}`,
      JSON.stringify({ id: session.id, title: session.title }),
      60 * 60 * 24 * 7,
    );

    return session;
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateSessionDto) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { title: dto.title },
    });

    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify({ id: updated.id, title: updated.title }),
      60 * 60 * 24 * 7,
    );

    return updated;
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    await this.redis.del(`session:${sessionId}`);

    return { deleted: true };
  }

  async addMessage(sessionId: string, role: string, content: string, metadata?: any) {
    const message = await this.prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        metadata,
      },
    });

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}
