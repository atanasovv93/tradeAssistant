import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from '../news/create-article.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
