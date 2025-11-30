/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoKline } from '../entities/crypto-kline.entity';

export interface Trend {
  symbol: string;
  open: number;
  mid?: number | null;
  close: number;
  change: number;
  trend: string;
}

@Injectable()
export class CryptoDailyAnalysisService {
  constructor(
    @InjectRepository(CryptoKline)
    private readonly klineRepo: Repository<CryptoKline>,
  ) { }

  /**
   * Daily trends
   */
  async analyzeDailyTrends() {
    const symbols = (process.env.SYMBOLS || '').split(',').filter(Boolean);
    const trends: Trend[] = [];

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

  /**
   * Weekly trends
   */
  async analyzeWeeklyTrends() {
    const symbols = (process.env.SYMBOLS || '').split(',').filter(Boolean);
    const trends: Trend[] = [];

    for (const symbol of symbols) {
      const data = await this.klineRepo.find({
        where: { symbol },
        order: { openTime: 'DESC' },
        take: 8,
      });

      if (data.length < 2) continue;

      const first = data[data.length - 1];
      const last = data[0];

      const open = Number(first.open);
      const close = Number(last.close);

      const change = ((close - open) / open) * 100;

      trends.push({
        symbol,
        open: +open.toFixed(4),
        close: +close.toFixed(4),
        change: +change.toFixed(2),
        trend: change >= 0 ? '📈 Bullish' : '📉 Bearish',
      });
    }

    return { trends };
  }

  /**
   * Monthly trends
   */
  async analyzeMonthlyTrends() {
    const symbols = (process.env.SYMBOLS || '').split(',').filter(Boolean);
    const trends: Trend[] = [];

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (const symbol of symbols) {
      const data = await this.klineRepo.find({
        where: { symbol },
        order: { openTime: 'DESC' },
        take: daysInMonth,
      });

      if (data.length < 2) continue;

      const first = data[data.length - 1];
      const last = data[0];

      const open = Number(first.open);
      const close = Number(last.close);

      const change = ((close - open) / open) * 100;

      trends.push({
        symbol,
        open: +open.toFixed(4),
        close: +close.toFixed(4),
        change: +change.toFixed(2),
        trend: change >= 0 ? '📈 Bullish' : '📉 Bearish',
      });
    }

    return { trends };
  }
}
