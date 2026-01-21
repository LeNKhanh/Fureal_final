import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createDto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other defaults
    if (createDto.isDefault) {
      await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      ...createDto,
      userId,
    });

    return this.addressRepository.save(address);
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(id: string, userId: string, updateDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If setting as default, unset other defaults
    if (updateDto.isDefault) {
      await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    }

    Object.assign(address, updateDto);
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
  }

  async getDefault(userId: string): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
  }
}
