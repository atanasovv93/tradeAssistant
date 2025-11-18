/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto } from '../dto/news/create-article.dto';
import { UpdateNewsDto } from '../dto/news/update-article.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
  ) {}

  async create(dto: CreateNewsDto): Promise<News> {
    if (!dto.title || dto.title.trim() === '') {
      throw new BadRequestException('Title is required');
    }

    if (!dto.content || dto.content.trim() === '') {
      throw new BadRequestException('Content is required');
    }

    const news = this.newsRepo.create({
      ...dto,
      publishDate: dto.publishDate ?? new Date(),
    });

    return this.newsRepo.save(news);
  }

  async findAll(query?: { search?: string; page?: number; limit?: number }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.search) {
      where.title = `%${query.search}%`;
    }

    const [items, total] = await this.newsRepo.findAndCount({
      where,
      order: { publishDate: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepo.findOne({ where: { id } });
    if (!news) throw new NotFoundException('News not found');
    return news;
  }

  async update(id: number, dto: UpdateNewsDto): Promise<News> {
    const news = await this.findOne(id);
    Object.assign(news, dto);
    return this.newsRepo.save(news);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const news = await this.findOne(id);
    await this.newsRepo.remove(news);
    return { deleted: true };
  }
}
