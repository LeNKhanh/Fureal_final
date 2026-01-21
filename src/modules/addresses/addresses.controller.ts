import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create address (requires authentication)' })
  create(@GetUser() user: any, @Body() createDto: CreateAddressDto) {
    return this.addressesService.create(user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my addresses' })
  findAll(@GetUser() user: any) {
    return this.addressesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.addressesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(@Param('id') id: string, @GetUser() user: any, @Body() updateDto: UpdateAddressDto) {
    return this.addressesService.update(id, user.userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.addressesService.remove(id, user.userId);
  }
}
