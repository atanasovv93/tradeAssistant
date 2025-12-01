/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CryptoMarketService } from '../services/crypto-market.service';

@Injectable()
export class CryptoSyncCron {
  private readonly logger = new Logger(CryptoSyncCron.name);

  constructor(private readonly cryptoService: CryptoMarketService) {}

  @Cron('30 9 * * *') // секоја сабајле 09:30 (UTC)
async handleDailySync() {
  this.logger.log('Starting daily crypto sync...');
  await this.cryptoService.syncDaily();
  this.logger.log('Crypto sync finished.');
}
}
