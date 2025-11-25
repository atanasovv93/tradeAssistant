/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CryptoMarketService } from '../services/crypto-market.service';

@Injectable()
export class CryptoSyncCron {
  private readonly logger = new Logger(CryptoSyncCron.name);

  constructor(private readonly cryptoService: CryptoMarketService) {}

  @Cron('0 0 * * *') // секоја ноќ 00:00
  async handleDailySync() {
    this.logger.log('Starting daily crypto sync...');
    await this.cryptoService.syncDaily();
    this.logger.log('Crypto sync finished.');
  }
}
