import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ForexRateService } from './forex-rate.service';
import { ForexApiResponse } from './dto/forex-api-response.dto';

@Injectable()
export class ForexFetchService {
  private readonly logger = new Logger(ForexFetchService.name);
  private readonly API_URL =
    'https://api.forexrateapi.com/v1/latest?api_key=e72bc7f3a3c16ca609354e27734c4c8f&base=USD&currencies=GBP,CHF,EUR,CAD,AUD,MKD';

  constructor(private readonly forexRateService: ForexRateService) {}

  @Cron(CronExpression.EVERY_8_HOURS)
  async fetchAndSave() {
    try {
      const response = await axios.get<ForexApiResponse>(this.API_URL); // Type-safe
      const data = response.data;

      if (!data.success) {
        this.logger.warn('⚠️ Forex API response unsuccessful.');
        return;
      }

      // Пополнуваме timestamp (ако го нема, користиме тековен)
      const timestamp = data.timestamp ?? Math.floor(Date.now() / 1000);

      await this.forexRateService.create({
        base: data.base,
        rates: data.rates,
        timestamp,
      });

      this.logger.log('✅ Forex rates successfully updated.');
    } catch (error) {
      this.logger.error(
        '❌ Error fetching forex rates:',
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }
}
