import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async checkOut(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });
    await this.prisma.cart.delete({
      where: { id: cart.id },
    });
    return { message: 'Order placed successfully', order };
  }

  async getOrders(userId: string) {}

  async getOrder(orderId: string, userId: string) {}
}
