/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoKline } from '../entities/crypto-kline.entity';

@Injectable()
export class CryptoDailyAnalysisService {
  constructor(
    @InjectRepository(CryptoKline)
    private readonly klineRepo: Repository<CryptoKline>,
  ) {}

  /**
   * Main function required by NewsPublishService
   */
  async analyzeDailyTrends() {
    const symbols = (process.env.SYMBOLS || '').split(',').filter(Boolean);
    const trends: Array<{
      symbol: string;
      open: number;
      mid: number | null;
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

      const open = Number(today.open);
      const high = Number(today.high);
      const low = Number(today.low);
      const close = Number(today.close);
      const prevClose = Number(yesterday.close);

      if (!Number.isFinite(open) || !Number.isFinite(close) || !Number.isFinite(prevClose)) {
        // ако има скршени податоци, скачи го симболот
        continue;
      }

      const change = ((close - prevClose) / prevClose) * 100;

      let mid: number | null = null;
      if (Number.isFinite(high) && Number.isFinite(low)) {
        mid = +(((high + low) / 2).toFixed(4));
      }

      trends.push({
        symbol,
        open: +open.toFixed(4),
        mid,
        close: +close.toFixed(4),
        change: +change.toFixed(2),
        trend: change >= 0 ? '📈 Bullish' : '📉 Bearish',
      });
    }

    return { trends };
  }
}
