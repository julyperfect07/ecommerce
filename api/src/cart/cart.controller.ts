import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart fetched successfully' })
  @Get()
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Not enough stock' })
  @Post('items')
  addItemToCart(
    @Body() addItemDto: AddItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.addItemToCart(userId, addItemDto);
  }

  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiResponse({ status: 200, description: 'Quantity updated successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @Patch('items/:itemId')
  updateQuantity(
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.updateQuantity(itemId, updateItemDto, userId);
  }

  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @Delete('items/:itemId')
  deleteItemFromCart(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.deleteItemFromCart(itemId, userId);
  }
}
