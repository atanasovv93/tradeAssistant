/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoKline } from '../entities/crypto-kline.entity';
import { BinanceService } from './binance.service';
import { CryptoMarketService } from './crypto-market.service';
import { CryptoSyncCron } from '../cron/crypto-sync.cron';
import { CryptoAnalysisService } from './crypto-analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoKline])],
  providers: [
    BinanceService,
    CryptoMarketService,
    CryptoSyncCron,
    CryptoAnalysisService, // ⬅⬅ важно!
  ],
  exports: [
    BinanceService,
    CryptoMarketService,
    CryptoAnalysisService, // ⬅⬅ да може NewsModule да го користи
  ],
})
export class BinanceModule {}
