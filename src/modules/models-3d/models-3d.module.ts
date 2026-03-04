import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model3D } from './entities/model-3d.entity';
import { Models3DService } from './models-3d.service';
import { Models3DController } from './models-3d.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Model3D]), AuditLogsModule],
  controllers: [Models3DController],
  providers: [Models3DService],
  exports: [Models3DService],
})
export class Models3DModule {}
