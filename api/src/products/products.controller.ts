import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { ProductQueryDto } from './dto/product-query.dto';

const fileOptions = {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(new BadRequestException('Only image files are allowed'), false);
    } else {
      cb(null, true);
    }
  },
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @ApiOperation({ summary: 'Get all products with search and pagination' })
  @ApiResponse({ status: 200, description: 'Products fetched successfully' })
  @Get()
  getProducts(@Query() queryDto: ProductQueryDto) {
    return this.productsService.getProducts(queryDto);
  }

  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, description: 'Product fetched successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @ApiOperation({ summary: 'Create a new product (admin only)' })
  @ApiConsumes('multipart/form-data') // 👈 tells Swagger this accepts file upload
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @ApiOperation({ summary: 'Update product by id (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file', fileOptions))
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

  @ApiOperation({ summary: 'Delete product by id (admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Delete(':id')
  @UseGuards(JwtGuard)
  deleteProduct(
    @Param('id') id: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.deleteProduct(id, userRole);
  }
}
