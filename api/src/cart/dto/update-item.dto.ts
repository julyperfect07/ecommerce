import { IsNotIn, IsNumber, Min } from 'class-validator';

export class UpdateItemDto {
  @IsNumber()
  @IsNotIn([0])
  quantity!: number;
}
