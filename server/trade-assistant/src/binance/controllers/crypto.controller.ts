/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { CryptoMarketService } from '../services/crypto-market.service';
import { CryptoDailyAnalysisService } from '../services/crypto-analysis.service';
import { CryptoAnalysisService } from '../services/analysis/crypto-analysis.service';
import { Trend } from '../services/crypto-analysis.service'; // исправи го патот според твојата структура

@Controller('crypto')
export class CryptoController {
  constructor(
    private readonly cryptoService: CryptoMarketService,
    private readonly cryptoDailyAnalysisService: CryptoDailyAnalysisService,
    private readonly cryptoAnalysisService: CryptoAnalysisService,
  ) {}

  @Get('sync')
  async syncAll() {
    return this.cryptoService.syncDaily();
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
