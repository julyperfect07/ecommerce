import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @Post('checkout')
  checkOut(@CurrentUser('id') userId: string) {
    return this.ordersService.checkOut(userId);
  }

  @Get()
  getOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrders(userId);
  }

  @Get(':id')
  getOrder(@Param('id') orderId: string, @CurrentUser('id') userId: string) {
    return this.ordersService.getOrder(orderId, userId);
  }

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
