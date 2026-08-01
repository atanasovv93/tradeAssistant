/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Metal } from './entities/metal.entity';
import { MetalDto } from './dto/metals.dto';
import { MetalsApiResponse } from './interfaces/metals-api-response.interface';

@Injectable()
export class MetalsService {
  private readonly logger = new Logger(MetalsService.name);
  private readonly apiKey = process.env.METALS_API_KEY;

  private readonly CACHE_TIME = 8 * 60 * 60 * 1000; // 8 hours

  constructor(
    @InjectRepository(Metal)
    private readonly metalRepository: Repository<Metal>,
  ) {}

  async getLatest(): Promise<MetalDto[]> {
  // Последен запис
  const latest = await this.metalRepository.find({
    order: {
      timestamp: 'DESC',
    },
    take: 1,
  });

  const latestRecord = latest[0];

  // Ако последниот update е помал од 8 часа
  if (latestRecord) {
    const age = Date.now() - latestRecord.timestamp.getTime();

    if (age < this.CACHE_TIME) {
      this.logger.log('Returning cached metals.');

      const cached = await this.metalRepository.find({
        order: {
          timestamp: 'DESC',
        },
        take: 4,
      });

      return cached
  .sort((a, b) => a.symbol.localeCompare(b.symbol))
  .map((m) => ({
    symbol: m.symbol,
    name: m.name,
    value: Number(m.value),
    timestamp: m.timestamp.toLocaleString('en-GB'),

    change: 0,
    changePercent: 0,
    trend: '➡️',
  }));
    }
  }

  this.logger.log('Fetching fresh metals from API...');

  try {
    const response = await axios.get<MetalsApiResponse>(
      'https://api.metals.dev/v1/latest',
      {
        params: {
          api_key: this.apiKey,
          currency: 'USD',
          unit: 'g',
        },
        timeout: 10000,
      },
    );

    const metals = response.data.metals;
    const previousMetals = await this.metalRepository.find({
  order: {
    timestamp: 'DESC',
  },
  take: 4,
});

const previousMap = new Map(
  previousMetals.map((m) => [m.symbol, Number(m.value)]),
);
    const latestMetals = [
  {
    symbol: 'GOLD',
    name: 'Gold',
    value: metals.gold,
  },
  {
    symbol: 'SILVER',
    name: 'Silver',
    value: metals.silver,
  },
  {
    symbol: 'PLATINUM',
    name: 'Platinum',
    value: metals.platinum,
  },
  {
    symbol: 'PALLADIUM',
    name: 'Palladium',
    value: metals.palladium,
  },
];

await this.metalRepository.save(latestMetals);

    const inserted = await this.metalRepository.find({
      order: {
        timestamp: 'DESC',
      },
      take: 4,
    });

    return inserted
  .sort((a, b) => a.symbol.localeCompare(b.symbol))
  .map((m) => {
    const previous = previousMap.get(m.symbol);

    const change =
      previous !== undefined
        ? Number((Number(m.value) - previous).toFixed(4))
        : 0;

    const changePercent =
      previous && previous !== 0
        ? Number(((change / previous) * 100).toFixed(3))
        : 0;

    return {
      symbol: m.symbol,
      name: m.name,
      value: Number(m.value),
      timestamp: m.timestamp.toLocaleString('en-GB'),

      change,
      changePercent,
      trend:
        change > 0
          ? '📈 Rise during the day'
          : change < 0
            ? '📉 Fall during the day'
            : '⏸️ No change detected',
    };
  });
  } catch (err: any) {
    this.logger.error(err.response?.data);
    this.logger.error(err.response?.status);
    this.logger.error(err.message);

    throw new HttpException(
      'Unable to fetch metals.',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
}