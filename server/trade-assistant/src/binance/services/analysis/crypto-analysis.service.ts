/* eslint-disable prettier/prettier */
  import { Injectable } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { CryptoKline } from '../../entities/crypto-kline.entity';
  import { Indicators } from '../../utils/indicators';

  @Injectable()
  export class CryptoAnalysisService {
    constructor(
      @InjectRepository(CryptoKline)
      private readonly klineRepo: Repository<CryptoKline>,
    ) {}

    async analyze(symbol: string) {
      const klines = await this.klineRepo.find({
        where: { symbol: symbol.toUpperCase() },
        order: { openTime: 'ASC' },
        take: 500, // последни ~500 дена (доста за индикатори)
      });

      if (!klines.length) {
        return { error: 'No market data found' };
      }

      const closes = klines.map(k => Number(k.close));
      const highs  = klines.map(k => Number(k.high));
      const lows   = klines.map(k => Number(k.low));

      // ---- INDICATORS ----
      const ema20 = Indicators.ema(closes, 20);
      const ema50 = Indicators.ema(closes, 50);
      const rsi14 = Indicators.rsi(closes, 14);

      // ---- TREND ----
      const lastEma20 = ema20[ema20.length - 1];
      const lastEma50 = ema50[ema50.length - 1];
      let trend: 'bullish' | 'bearish' | 'sideways';

      if (lastEma20 > lastEma50) trend = 'bullish';
      else if (lastEma20 < lastEma50) trend = 'bearish';
      else trend = 'sideways';

      // ---- VOLATILITY ----
      const last20High = Math.max(...highs.slice(-20));
      const last20Low = Math.min(...lows.slice(-20));
      const volatilityPct = ((last20High - last20Low) / closes[closes.length - 1]) * 100;

      const volatility =
        volatilityPct > 8 ? 'high' :
        volatilityPct > 4 ? 'medium' : 'low';

      // ---- RSI ----
      const lastRsi = rsi14[rsi14.length - 1];
      let rsiSignal = 'neutral';

      if (lastRsi > 70) rsiSignal = 'overbought';
      if (lastRsi < 30) rsiSignal = 'oversold';

      // ---- RESPONSE ----
      return {
        symbol,
        trend,
        volatility,
        rsi: Number(lastRsi.toFixed(2)),
        price: closes[closes.length - 1],

        indicators: {
          ema20: Number(lastEma20.toFixed(4)),
          ema50: Number(lastEma50.toFixed(4)),
        },

        signals: {
          trendSignal: trend === 'bullish' ? 'buy' : trend === 'bearish' ? 'sell' : 'neutral',
          rsiSignal,
        },
      };
    }
  }
