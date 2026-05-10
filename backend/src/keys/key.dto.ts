import { IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeyDto {
  @ApiProperty({ example: 'My API Key' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1000, required: false, description: '配额数量，0表示无限制' })
  @IsOptional()
  @IsInt()
  @Min(0)
  quota?: number;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  expiresAt?: string;
}

export class UpdateKeyDto {
  @ApiProperty({ example: 'Updated Name', required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  quota?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
