/* eslint-disable prettier/prettier */ 
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { BinanceService } from './binance.service';

@Injectable()
export class CryptoMarketService {
  constructor(private readonly binance: BinanceService) {}

  async syncDaily() {
  const symbolsEnv = process.env.SYMBOLS;
  if (!symbolsEnv) throw new Error('SYMBOLS not defined in .env');

  const symbols = symbolsEnv.split(',');

  for (const symbol of symbols) {
    await this.binance.syncSymbol(symbol);
  }
}

  /**
   * Returns full history from database for a symbol.
   * (We no longer call getYearlyKlines because we use smart sync)
   */
  async getHistory(symbol: string) {
    return this.binance.getHistoryFromDB(symbol);
  }
}
