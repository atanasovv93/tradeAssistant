/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from '../dto/news/create-article.dto';
import { UpdateNewsDto } from '../dto/news/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NewsPublishService } from './news-publish.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsPublishService: NewsPublishService,
  ) {}

@Get('publish-daily-forex')
async publishDailyForex() {
  try {
    const published = await this.newsPublishService.publishDailyForexAnalysis();

    if (!published) {
      return { message: '⚠️ Not enough data for daily analysis today.' };
    }

    return { message: '✅ Daily Forex analysis news published successfully.' };
  } catch (error) {
    return { message: '❌ Error publishing daily Forex analysis.', error };
  }
}

  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.newsService.findAll({ search, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe({
    errorHttpStatusCode: 400,
    exceptionFactory: (errors) => new BadRequestException('❌ ID must be a numeric value'),
  })) id: number) {
    return this.newsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', new ParseIntPipe({
    errorHttpStatusCode: 400,
    exceptionFactory: () => new BadRequestException('❌ ID must be a numeric value'),
  })) id: number, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', new ParseIntPipe({
    errorHttpStatusCode: 400,
    exceptionFactory: () => new BadRequestException('❌ ID must be a numeric value'),
  })) id: number) {
    return this.newsService.remove(id);
  }
}
