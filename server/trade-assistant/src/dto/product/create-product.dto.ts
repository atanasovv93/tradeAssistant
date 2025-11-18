/* eslint-disable prettier/prettier */
import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ProductCategory } from '../../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  distributor?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsString()
  barcode?: string;
}
