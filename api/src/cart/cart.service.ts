import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

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

    // 🔴 check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // 🔴 check stock
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock for "${product.name}". Available: ${product.stock}`,
      );
    }

    // check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // 🔴 check stock including already existing quantity in cart
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Not enough stock for "${product.name}". Available: ${product.stock}`,
        );
      }

      const item = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
      return { message: 'Item quantity updated', item };
    }

    const item = await this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
    return { message: 'Item added to cart', item };
  }

  async updateQuantity(
    itemId: string,
    updateItemDto: UpdateItemDto,
    userId: string,
  ) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) throw new NotFoundException('Item not found in your cart');

    const newQuantity = item.quantity + updateItemDto.quantity;

    if (newQuantity < 1)
      throw new BadRequestException('Quantity cannot be less than 1');

    // 🔴 check stock on update too
    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (product && product.stock < newQuantity) {
      throw new BadRequestException(
        `Not enough stock for "${product.name}". Available: ${product.stock}`,
      );
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    return { message: 'Quantity updated successfully', updatedItem };
  }

  async deleteItemFromCart(itemId: string, userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Item not found in your cart');

    await this.prisma.cartItem.delete({
      where: { id: itemId, cartId: cart.id },
    });

    return { message: 'Item deleted successfully' };
  }
}
