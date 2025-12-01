/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ForexRateService } from './forex-rate.service';
import { ForexApiResponse } from './dto/forex-api-response.dto';

@Injectable()
export class ForexFetchService {
  private readonly logger = new Logger(ForexFetchService.name);

  // директно од process.env
  private readonly apiUrl = process.env.FOREX_API_URL;
  private readonly apiKey = process.env.FOREX_API_KEY ;

  constructor(private readonly forexRateService: ForexRateService) {}

  @Cron(CronExpression.EVERY_8_HOURS)
  async fetchAndSave() {
    try {
      if (!this.apiKey) {
        this.logger.error('❌ FOREX_API_KEY не е подесен во process.env');
        return;
      }

      // Fixer стил: ?access_key=...
      const url = `${this.apiUrl}?access_key=${this.apiKey}&symbols=USD,AUD,CAD,GBP,CHF,MKD&format=1`;
      const response = await axios.get<ForexApiResponse>(url);
      const data = response.data;

      if (!data.success) {
        this.logger.warn('⚠️ Forex API response unsuccessful.', data);
        return;
      }

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
