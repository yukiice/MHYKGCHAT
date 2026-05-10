import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: '新会话' })
  @IsNotEmpty()
  title: string;
}

export class UpdateSessionDto {
  @ApiProperty({ example: '更新后的标题', required: false })
  @IsOptional()
  title?: string;
}
