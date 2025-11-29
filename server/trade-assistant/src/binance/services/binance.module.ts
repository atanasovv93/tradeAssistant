/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoKline } from '../entities/crypto-kline.entity';
import { BinanceService } from '../services/binance.service';
import { CryptoMarketService } from '../services/crypto-market.service';
import { CryptoController } from '../controllers/crypto.controller';
import { CryptoSyncCron } from '../cron/crypto-sync.cron';
import { CryptoAnalysisService } from './analysis/crypto-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoKline]),
  ],
  controllers: [CryptoController],
  providers: [
    BinanceService,
    CryptoMarketService,
    CryptoSyncCron,
    CryptoAnalysisService,
  ],
  exports: [
    CryptoMarketService,
    BinanceService,
    CryptoAnalysisService, 
  ],
})
export class BinanceModule {}

