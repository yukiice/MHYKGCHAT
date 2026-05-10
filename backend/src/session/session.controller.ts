import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('会话管理')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: '创建新会话' })
  async createSession(@Request() req, @Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取会话列表' })
  async getSessions(@Request() req) {
    return this.sessionService.getSessions(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取会话详情' })
  async getSession(@Request() req, @Param('id') id: string) {
    return this.sessionService.getSession(req.user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新会话' })
  async updateSession(@Request() req, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionService.updateSession(req.user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除会话' })
  async deleteSession(@Request() req, @Param('id') id: string) {
    return this.sessionService.deleteSession(req.user.sub, id);
  }
}
