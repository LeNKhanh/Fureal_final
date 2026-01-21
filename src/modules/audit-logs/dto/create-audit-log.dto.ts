import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  action: string;

  @IsString()
  target: string;
}
