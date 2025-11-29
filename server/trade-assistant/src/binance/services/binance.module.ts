/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoKline } from '../entities/crypto-kline.entity';
import { BinanceService } from './binance.service';
import { CryptoMarketService } from './crypto-market.service';
import { CryptoSyncCron } from '../cron/crypto-sync.cron';
import { CryptoDailyAnalysisService } from './crypto-analysis.service';
import { CryptoAnalysisService } from './analysis/crypto-analysis.service';
import { CryptoController } from '../controllers/crypto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoKline]),
  ],
  controllers: [CryptoController],
  providers: [
    BinanceService,
    CryptoMarketService,
    CryptoSyncCron,
    CryptoDailyAnalysisService,
    CryptoAnalysisService,
  ],
  exports: [
    BinanceService,
    CryptoMarketService,
    CryptoDailyAnalysisService,
    CryptoAnalysisService,
  ],
})
export class BinanceModule {}
