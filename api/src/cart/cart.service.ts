import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }
  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const cartWithItems = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return { message: 'Cart fetched successfully', cart: cartWithItems };
  }

  async addItemToCart(userId: string, addItemDto: AddItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const { productId, quantity } = addItemDto;

    // check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // 👇 if exists, just increase quantity
      const item = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return { message: 'Item quantity updated', item };
    }

    // 👇 if not exists, create new cart item
    const item = await this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
    return { message: 'Item added to cart', item };
  }
}
