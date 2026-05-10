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
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { CurrentUser } from '../common/decorators/currentuser.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {} // 👈 inject service

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.createProduct(createProductDto, userRole);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteProduct(
    @Param('id') id: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.deleteProduct(id, userRole);
  }
}
