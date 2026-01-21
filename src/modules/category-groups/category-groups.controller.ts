import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryGroupsService } from './category-groups.service';
import { CreateCategoryGroupDto } from './dto/create-category-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Category Groups')
@Controller('category-groups')
export class CategoryGroupsController {
  constructor(private readonly categoryGroupsService: CategoryGroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category group (Admin/Manager only)' })
  create(@Body() createDto: CreateCategoryGroupDto) {
    return this.categoryGroupsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all category groups' })
  findAll() {
    return this.categoryGroupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category group by ID' })
  findOne(@Param('id') id: string) {
    return this.categoryGroupsService.findOne(+id);
  }
}
