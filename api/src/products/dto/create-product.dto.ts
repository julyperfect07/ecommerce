import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number) // 👈 converts string to number
  @IsNumber()
  @IsPositive()
  price!: number;

  @Type(() => Number) // 👈 converts string to number
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
