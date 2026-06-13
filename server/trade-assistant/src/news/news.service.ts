/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto } from '../dto/news/create-article.dto';
import { UpdateNewsDto } from '../dto/news/update-article.dto';
import { NewsLanguage } from '../enums/news-language.enum';
import { AiService } from '../ai/ai.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    private readonly aiService: AiService,
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
      language: NewsLanguage.EN,
    });

    const savedNews = await this.newsRepo.save(news);

    // автоматски превод на DE
    await this.createGermanTranslation(savedNews);

    return savedNews;
  }

  private async createGermanTranslation(news: News): Promise<void> {
    const prompt = `
Translate the following news article into German.

Rules:
- Keep all numbers unchanged.
- Keep emojis unchanged.
- Keep forex values unchanged.
- Return ONLY valid JSON.
- Do not use markdown.

JSON format:

{
  "title": "",
  "fixedMorningMessage": "",
  "content": ""
}

TITLE:
${news.title}

FIXED MORNING MESSAGE:
${news.fixedMorningMessage ?? ''}

CONTENT:
${news.content}
`;

    const response = await this.aiService.ask(prompt);

    if (!response) {
      throw new Error('AI returned empty response');
    }

    const translated = JSON.parse(response);

    const germanNews = this.newsRepo.create({
      title: translated.title,
      fixedMorningMessage: translated.fixedMorningMessage,
      content: translated.content,
      image: news.image,
      author: news.author,
      publishDate: news.publishDate,
      category: news.category,
      language: NewsLanguage.DE,
    });

    await this.newsRepo.save(germanNews);
  }

 async findAll(query?: {
  search?: string;
  page?: number;
  limit?: number;
  language?: NewsLanguage;
}) {
  const page = query?.page && query.page > 0 ? query.page : 1;
  const limit = query?.limit && query.limit > 0 ? query.limit : 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query?.language) {
    where.language = query.language;
  }

  if (query?.search) {
    where.title = `%${query.search}%`;
  }

  const [items, total] = await this.newsRepo.findAndCount({
    where,
    order: {
      publishDate: 'DESC',
      createdAt: 'DESC',
    },
    skip,
    take: limit,
  });

  return {
    items,
    total,
    page,
    limit,
  };
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
