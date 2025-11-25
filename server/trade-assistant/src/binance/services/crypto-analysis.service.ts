/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoKline } from '../entities/crypto-kline.entity';

@Injectable()
export class CryptoAnalysisService {
  constructor(
    @InjectRepository(CryptoKline)
    private readonly klineRepo: Repository<CryptoKline>,
  ) {}

  /**
   * Main function required by NewsPublishService
   */
  async analyzeDailyTrends() {
    const symbols = (process.env.SYMBOLS || '').split(',');
    const trends: Array<{
      symbol: string;
      open: number;
      mid: number;
      close: number;
      change: number;
      trend: string;
    }> = [];

    for (const symbol of symbols) {
      const data = await this.klineRepo.find({
        where: { symbol },
        order: { openTime: 'DESC' },
        take: 2,
      });

      if (data.length < 2) continue;

      const today = data[0];
      const yesterday = data[1];

      const change = ((today.close - yesterday.close) / yesterday.close) * 100;

      trends.push({
        symbol,
        open: today.open,
        mid: (today.high + today.low) / 2,
        close: today.close,
        change: +change.toFixed(2),
        trend: change >= 0 ? '📈 Bullish' : '📉 Bearish',
      });
    }

    return { trends };
  }
}
