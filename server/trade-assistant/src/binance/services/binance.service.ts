/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { CryptoKline } from '../entities/crypto-kline.entity';
import { BinanceKline } from '../interfaces/bininaceKline.interface';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);

  constructor(
    @InjectRepository(CryptoKline)
    private readonly klineRepo: Repository<CryptoKline>,
  ) {}

  async fetchAndSaveAllSymbols(): Promise<void> {
    const symbolsEnv = process.env.SYMBOLS;
    if (!symbolsEnv) throw new Error('SYMBOLS not defined in .env');

    const symbols = symbolsEnv.split(',');

    for (const symbol of symbols) {
      this.logger.log(`🔄 Syncing ${symbol}...`);
      await this.syncSymbol(symbol);
    }
  }


  /**
   * MAIN SMART SYNC
   */
  async syncSymbol(symbol: string, interval = '1d'): Promise<void> {
    const last = await this.klineRepo.findOne({
      where: { symbol },
      order: { openTime: 'DESC' },
    });

    let startTime: number;

    if (!last) {
      // FIRST TIME: sync 1 year
      this.logger.log(`📥 First sync for ${symbol}, downloading 1 year...`);
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      startTime = Date.now() - oneYear;
    } else {
      // DAILY UPDATE: sync only missing data
      startTime = Number(last.closeTime) + 1;
      this.logger.log(`📈 Updating ${symbol} from ${new Date(startTime).toISOString()}`);
    }

    const endTime = Date.now();

    const klines = await this.getKlines(symbol, interval, startTime, endTime);

    if (!klines.length) {
      this.logger.log(`✔ ${symbol} is already up to date.`);
      return;
    }

    await this.saveKlines(symbol, klines);

    this.logger.log(`💾 Saved ${klines.length} new klines for ${symbol}`);
  }

  async getKlines(
    symbol: string,
    interval: string,
    startTime: number,
    endTime: number,
    retries = 3,
  ): Promise<BinanceKline[]> {

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get<BinanceKline[]>(url, { timeout: 10000 });
        return response.data;
      } catch (err) {
        this.logger.warn(`Attempt ${attempt} failed for ${symbol}: ${err}`);
        if (attempt === retries) throw err;
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }

    return [];
  }

  async saveKlines(symbol: string, klines: BinanceKline[]): Promise<void> {
    if (!klines.length) return;

    const dataToSave = klines.map((k) => ({
      symbol,
      openTime: Number(k[0]),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
      takerBuyVolume: parseFloat(k[9]),
      quoteVolume: parseFloat(k[7]),
      closeTime: Number(k[6]),
      numberOfTrades: Number(k[8]),
    }));

    await this.klineRepo.save(dataToSave, { chunk: 300 });
  }

  async getHistoryFromDB(symbol: string) {
  return this.klineRepo.find({
    where: { symbol },
    order: { openTime: 'ASC' },
  });
}

}
