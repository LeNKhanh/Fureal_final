import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGroup } from './entities/category-group.entity';
import { CreateCategoryGroupDto } from './dto/create-category-group.dto';
import { UpdateCategoryGroupDto } from './dto/update-category-group.dto';

@Injectable()
export class CategoryGroupsService {
  constructor(
    @InjectRepository(CategoryGroup)
    private categoryGroupRepository: Repository<CategoryGroup>,
  ) {}

  async create(createDto: CreateCategoryGroupDto): Promise<CategoryGroup> {
    const categoryGroup = this.categoryGroupRepository.create(createDto);
    return this.categoryGroupRepository.save(categoryGroup);
  }

  async findAll(): Promise<CategoryGroup[]> {
    return this.categoryGroupRepository.find({ relations: ['categories'] });
  }

  async findOne(id: number): Promise<CategoryGroup> {
    const categoryGroup = await this.categoryGroupRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!categoryGroup) {
      throw new NotFoundException(`Category group with ID ${id} not found`);
    }

    return categoryGroup;
  }

  async update(id: number, updateDto: UpdateCategoryGroupDto): Promise<CategoryGroup> {
    const categoryGroup = await this.findOne(id);
    Object.assign(categoryGroup, updateDto);
    return this.categoryGroupRepository.save(categoryGroup);
  }

  async remove(id: number): Promise<{ message: string }> {
    const categoryGroup = await this.findOne(id);
    await this.categoryGroupRepository.remove(categoryGroup);
    return { message: `Category group with ID ${id} has been deleted` };
  }
}
