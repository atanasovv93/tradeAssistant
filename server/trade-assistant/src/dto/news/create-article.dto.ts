/* eslint-disable prettier/prettier */
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
  
  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
