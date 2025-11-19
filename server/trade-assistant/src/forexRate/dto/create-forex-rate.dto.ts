import { IsString, IsObject, IsNumber, IsOptional } from 'class-validator';

export class CreateForexRateDto {
  @IsString()
  base: string;

  @IsObject()
  rates: Record<string, number>;

  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @IsOptional()
  createdAt?: Date;
}
