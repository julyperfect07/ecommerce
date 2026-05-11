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
import { CartService } from './cart.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItemToCart(
    @Body() addItemDto: AddItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.addItemToCart(userId, addItemDto);
  }

  @Patch('items/:itemId')
  updateQuantity(
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.updateQuantity(itemId, updateItemDto, userId);
  }

  @Delete('items/:itemId')
  deleteItemFromCart(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cartService.deleteItemFromCart(itemId, userId);
  }
}
