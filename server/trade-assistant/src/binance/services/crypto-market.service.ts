/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { BinanceService } from './binance.service';

@Injectable()
export class CryptoMarketService {
  private readonly logger = new Logger(CryptoMarketService.name);

  constructor(private readonly binance: BinanceService) {}

  async syncDaily() {
    const symbolsEnv = process.env.SYMBOLS;
    if (!symbolsEnv) throw new Error('SYMBOLS not defined in .env');

    const symbols = symbolsEnv.split(',');

    for (const symbol of symbols) {
      this.logger.log(`🔁 Daily sync for ${symbol}...`);
      await this.binance.syncSymbol(symbol);

      // мала пауза да не ги тепаме Binance одма едно по друго
      await new Promise((r) => setTimeout(r, 800)); // 0.8s
    }
  }

  async getHistory(symbol: string) {
    return this.binance.getHistoryFromDB(symbol);
  }
}
