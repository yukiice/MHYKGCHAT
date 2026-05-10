import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('用量统计')
@ApiBearerAuth()
@Controller('usage')
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private usageService: UsageService) {}

  @Get('summary')
  @ApiOperation({ summary: '获取用量汇总' })
  async getSummary(@Request() req) {
    return this.usageService.getSummary(req.user.sub);
  }

  @Get('logs')
  @ApiOperation({ summary: '获取用量日志' })
  async getLogs(
    @Request() req,
    @Query('keyId') keyId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.usageService.getLogs(req.user.sub, keyId, limit, offset);
  }

  @Get('by-key/:id')
  @ApiOperation({ summary: '获取指定 Key 的用量' })
  async getUsageByKey(@Request() req, @Param('id') id: string) {
    return this.usageService.getUsageByKey(req.user.sub, id);
  }
}
