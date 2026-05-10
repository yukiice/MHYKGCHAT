import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { KeyService } from './key.service';
import { CreateKeyDto, UpdateKeyDto } from './key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('API Key 管理')
@ApiBearerAuth()
@Controller('keys')
@UseGuards(JwtAuthGuard)
export class KeyController {
  constructor(private keyService: KeyService) {}

  @Post()
  @ApiOperation({ summary: '创建新的 API Key' })
  async createKey(@Request() req, @Body() dto: CreateKeyDto) {
    return this.keyService.createKey(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户的 API Key 列表' })
  async getKeys(@Request() req) {
    return this.keyService.getKeys(req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新 API Key' })
  async updateKey(@Request() req, @Param('id') id: string, @Body() dto: UpdateKeyDto) {
    return this.keyService.updateKey(req.user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 API Key' })
  async deleteKey(@Request() req, @Param('id') id: string) {
    return this.keyService.deleteKey(req.user.sub, id);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: '获取 API Key 使用统计' })
  async getKeyUsage(@Request() req, @Param('id') id: string) {
    return this.keyService.getKeyUsage(req.user.sub, id);
  }
}
