import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Shopping Cart')
@Controller('carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('my-cart')
  @ApiOperation({ summary: 'Get my cart (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  getMyCart(@GetUser() user: any) {
    return this.cartsService.getMyCart(user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addItem(@GetUser() user: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addItem(user.userId, addToCartDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  removeItem(@GetUser() user: any, @Param('itemId') itemId: string) {
    return this.cartsService.removeItem(user.userId, +itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  clearCart(@GetUser() user: any) {
    return this.cartsService.clearCart(user.userId);
  }
}
