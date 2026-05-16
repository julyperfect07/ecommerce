import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { ProductQueryDto } from './dto/product-query.dto';

const fileOptions = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(new BadRequestException('Only image files are allowed'), false);
    } else {
      cb(null, true);
    }
  },
};

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getProducts(@Query() queryDto: ProductQueryDto) {
    return this.productsService.getProducts(queryDto);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file', fileOptions))
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.createProduct(createProductDto, file, userRole);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file', fileOptions)) // 👈 optional file
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.updateProduct(
      id,
      updateProductDto,
      file,
      userRole,
    );
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
