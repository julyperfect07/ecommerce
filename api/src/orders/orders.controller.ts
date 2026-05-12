import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @Post()
  checkOut(@CurrentUser('id') userId: string) {
    return '';
  }

  @Get()
  getOrders(@CurrentUser('id') userId: string) {}

  @Get(':id')
  getOrder(@Param('id') orderId: string, @CurrentUser('id') userId: string) {}
}
