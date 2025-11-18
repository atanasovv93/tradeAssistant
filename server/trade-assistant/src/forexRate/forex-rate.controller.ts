/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ForexRateService } from './forex-rate.service';
import { ForexAnalysisService, DailyAnalysis } from './forex-analysis.service';
import { ForexFetchService } from './forex-fetch.service';
import { CreateForexRateDto } from './dto/create-forex-rate.dto';

@Controller('forex')
export class ForexRateController {
  constructor(
    private readonly forexRateService: ForexRateService,
    private readonly forexAnalysisService: ForexAnalysisService,
    private readonly forexFetchService: ForexFetchService,
  ) {}

  @Get('fetch')
  async manualFetch(): Promise<{ message: string }> {
    await this.forexFetchService.fetchAndSave();
    return { message: 'Forex rates fetched manually ✅' };
  }

  @Get('latest')
  async getLatest() {
    return this.forexRateService.findLatest();
  }

  @Get('history')
  async getAll() {
    return this.forexRateService.findAll();
  }

  @Get('trends')
  async analyzeTrends(): Promise<DailyAnalysis | null> {
    return this.forexAnalysisService.analyzeDailyTrends();
  }

  @Post('create')
  async create(@Body() dto: CreateForexRateDto) {
    const record = {
      ...dto,
      timestamp: dto['timestamp'] ?? Math.floor(Date.now() / 1000),
    };
    return this.forexRateService.create(record);
  }

  @Delete('delete/:id')
  async deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.forexRateService.deleteById(id);
  }
}
