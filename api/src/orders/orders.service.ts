import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkOut(userId: string) {
    const cart = await this.prisma.cart.findUnique({
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

    // 🔴 check stock for all items before doing anything
    for (const item of cart.items) {
      if (!item.product) {
        throw new NotFoundException(`Product not found`);
      }
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for "${item.product.name}". Available: ${item.product.stock}`,
        );
      }
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // 🔴 wrap everything in a transaction — all or nothing
    const order = await this.prisma.$transaction(async (tx) => {
      // 1 - create the order
      const order = await tx.order.create({
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
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 2 - reduce stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3 - clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    return { message: 'Order placed successfully', order };
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return { message: 'Orders fetched successfully', orders };
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return { message: 'Order fetched successfully', order };
  }
}
