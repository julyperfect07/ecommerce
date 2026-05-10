import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getProducts() {
    const products = await this.prisma.product.findMany();
    return { message: 'Products fetched successfully', products };
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product fetched successfully', product };
  }

  async createProduct(createProductDto: CreateProductDto, userRole: string) {
    this.checkIfAdmin(userRole); // 👈 fixed missing ()
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    return { message: 'Product created successfully', product };
  }

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    userRole: string,
  ) {
    this.checkIfAdmin(userRole);
    const product = await this.prisma.product.update({
      // 👈 added await
      where: { id: productId }, // 👈 fixed id
      data: updateProductDto,
    });
    return { message: 'Product updated successfully', product }; // 👈 fixed message
  }

  async deleteProduct(productId: string, userRole: string) {
    this.checkIfAdmin(userRole);
    await this.prisma.product.delete({
      where: { id: productId }, // 👈 fixed id
    });
    return { message: 'Product deleted successfully' };
  }

  checkIfAdmin(userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to do this action',
      );
    }
  }
}
