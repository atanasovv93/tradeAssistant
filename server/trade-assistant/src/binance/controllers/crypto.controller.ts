/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoMarketService } from '../services/crypto-market.service';
import { CryptoDailyAnalysisService, Trend } from '../services/crypto-analysis.service';
import { CryptoAnalysisService } from '../services/analysis/crypto-analysis.service';
import { CryptoKline } from '../entities/crypto-kline.entity';

@Controller('crypto')
export class CryptoController {
  constructor(
    private readonly cryptoService: CryptoMarketService,
    private readonly cryptoDailyAnalysisService: CryptoDailyAnalysisService,
    private readonly cryptoAnalysisService: CryptoAnalysisService,

    @InjectRepository(CryptoKline)
    private readonly klineRepo: Repository<CryptoKline>,
  ) {}

  @Get('sync')
  async syncAll() {
    void this.cryptoService.syncDaily();
    return { message: 'Crypto rates fetched manually ✅' };
  }

  @Get('symbols')
  async getSymbols() {
    const rows = await this.klineRepo
      .createQueryBuilder('k')
      .select('DISTINCT k.symbol', 'symbol')
      .orderBy('k.symbol', 'ASC')
      .getRawMany();

    return rows.map((r) => r.symbol);
  }

  @Get('history/:symbol')
  async getHistory(@Param('symbol') symbol: string) {
    return this.cryptoService.getHistory(symbol.toUpperCase());
  }

  @Get('daily-trends')
  async dailyTrends(): Promise<{ trends: Trend[] }> {
    return this.cryptoDailyAnalysisService.analyzeDailyTrends();
  }

  @Get('weekly-trends')
  async weeklyTrends(): Promise<{ trends: Trend[] }> {
    return this.cryptoDailyAnalysisService.analyzeWeeklyTrends();
  }

  @Get('monthly-trends')
  async monthlyTrends(): Promise<{ trends: Trend[] }> {
    return this.cryptoDailyAnalysisService.analyzeMonthlyTrends();
  }

  @Get('analysis/:symbol')
  async analyze(@Param('symbol') symbol: string) {
    return this.cryptoAnalysisService.analyze(symbol);
    
  }
}
