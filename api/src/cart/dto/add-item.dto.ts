// dto/add-item.dto.ts
import { IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class AddItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
