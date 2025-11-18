import { IsString, IsObject, IsNumber, IsOptional } from 'class-validator';

export class CreateForexRateDto {
  @IsString()
  base: string;

  @IsObject()
  rates: Record<string, number>;

  @IsNumber()
  @IsOptional() // ако API-то не праќа, можеш да го додадеш автоматски при фетч
  timestamp?: number;

  @IsOptional()
  createdAt?: Date; // Date кога е зачувано во базата, може да е автоматски
}
