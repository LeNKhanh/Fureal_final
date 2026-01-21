import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroupsService } from './category-groups.service';
import { CategoryGroupsController } from './category-groups.controller';
import { CategoryGroup } from './entities/category-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryGroup])],
  controllers: [CategoryGroupsController],
  providers: [CategoryGroupsService],
  exports: [CategoryGroupsService],
})
export class CategoryGroupsModule {}
