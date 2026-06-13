/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { IsEnum } from 'class-validator';
import { NewsLanguage } from '../../enums/news-language.enum';
export class CreateNewsDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  fixedMorningMessage?: string;

  @IsString()
  content!: string;
  
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

  @IsString()
  language!: string;

}
