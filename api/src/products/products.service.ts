import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService, // 👈 inject upload service
  ) {}

  async getProducts(queryDto: ProductQueryDto) {
    const { page = 1, limit = 10, name, minPrice, maxPrice } = queryDto;

    const where = {
      name: name ? { contains: name, mode: 'insensitive' as const } : undefined,
      price: {
        gte: minPrice ?? undefined,
        lte: maxPrice ?? undefined,
      },
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: productSelect,
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit ?? undefined,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      message: 'Products fetched successfully',
      total,
      page: page ?? 1,
      limit: limit ?? total,
      products,
    };
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product fetched successfully', product };
  }

  async createProduct(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    userRole: string,
  ) {
    this.checkIfAdmin(userRole);

    // 👇 upload image if provided
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.uploadService.uploadImage(
        file,
        'ecommerce/products',
      );
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        imageUrl, //  undefined if no file, Prisma will just leave it null
      },
      select: productSelect,
    });
    return { message: 'Product created successfully', product };
  }

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File,
    userRole: string,
  ) {
    this.checkIfAdmin(userRole);

    // 👇 upload new image if provided
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.uploadService.uploadImage(
        file,
        'ecommerce/products',
      );
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...updateProductDto,
        ...(imageUrl && { imageUrl }), // 👈 only update imageUrl if new file was uploaded
      },
      select: productSelect,
    });
    return { message: 'Product updated successfully', product };
  }

  async deleteProduct(productId: string, userRole: string) {
    this.checkIfAdmin(userRole);
    await this.prisma.product.delete({ where: { id: productId } });
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
