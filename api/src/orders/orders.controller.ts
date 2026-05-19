import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Checkout - create order from cart' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cart is empty or not enough stock',
  })
  @Post('checkout')
  checkOut(@CurrentUser('id') userId: string) {
    return this.ordersService.checkOut(userId);
  }

  @ApiOperation({ summary: 'Get all orders for current user' })
  @ApiResponse({ status: 200, description: 'Orders fetched successfully' })
  @Get()
  getOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrders(userId);
  }

  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, description: 'Order fetched successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Get(':id')
  getOrder(@Param('id') orderId: string, @CurrentUser('id') userId: string) {
    return this.ordersService.getOrder(orderId, userId);
  }

  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser('role') userRole: string,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      updateOrderStatusDto,
      userRole,
    );
  }
}
