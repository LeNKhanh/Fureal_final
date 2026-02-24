import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty or insufficient stock' })
  @ApiResponse({ status: 403, description: 'Must be logged in' })
  create(@GetUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (Users see only their orders)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(@Query() filterDto: FilterOrderDto, @GetUser() user: any) {
    return this.ordersService.findAll(filterDto, user.userId, user.roleName);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get ALL orders (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'All orders retrieved successfully' })
  findAllAdmin(@Query() filterDto: FilterOrderDto) {
    return this.ordersService.findAll(filterDto, undefined, 'ADMIN');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID (Users see only their orders)' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.ordersService.findOne(id, user.userId, user.roleName);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update order status (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }
}
