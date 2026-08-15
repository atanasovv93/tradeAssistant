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

  // 8 часа
  private readonly CACHE_TIME = 8 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(Metal)
    private readonly metalRepository: Repository<Metal>,
  ) {}

  async getLatest(): Promise<MetalDto[]> {
    /*
     * =====================================================
     * 1. Земаме го најновиот запис од базата
     * =====================================================
     */

    const latestRecords = await this.metalRepository.find({
    order: {
      timestamp: 'DESC',
      id: 'DESC',
    },
    take: 1,
  });

  const latestRecord = latestRecords[0];

  /*
   * =====================================================
   * 2. CACHE
   * =====================================================
   */

  if (latestRecord) {
    const age =
      Date.now() - latestRecord.timestamp.getTime();

    if (age < this.CACHE_TIME) {
      this.logger.log(
        'Returning cached metals from database.',
      );

      const cached = await this.getLatestRecords();

      return cached.map((metal) =>
        this.toDto(metal),
      );
    }
  }


    /*
     * =====================================================
     * 3. ЗЕМАМЕ ПРЕТХОДНИ ВРЕДНОСТИ
     * =====================================================
     *
     * Ова е многу важно.
     *
     * Не користиме:
     *
     *   take: 4
     *
     * затоа што сакаме последна вредност за
     * секој различен metal.
     */

    const allRecords = await this.metalRepository.find({
      order: {
        timestamp: 'DESC',
      },
    });

    const previousMap = new Map<string, number>();

    for (const record of allRecords) {
      if (!previousMap.has(record.symbol)) {
        previousMap.set(
          record.symbol,
          Number(record.value),
        );
      }
    }

    this.logger.log(
      `Previous values: ${JSON.stringify(
        Object.fromEntries(previousMap),
      )}`,
    );

    /*
     * =====================================================
     * 4. ПОВИКУВАМЕ METALS API
     * =====================================================
     */

    this.logger.log(
      'Fetching fresh metals from Metals API...',
    );

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

      /*
       * =====================================================
       * 5. ГИ ПОДГОТВУВАМЕ НОВИТЕ ВРЕДНОСТИ
       * =====================================================
       */

      const latestMetals = [
        {
          symbol: 'GOLD',
          name: 'Gold',
          value: Number(metals.gold),
        },
        {
          symbol: 'SILVER',
          name: 'Silver',
          value: Number(metals.silver),
        },
        {
          symbol: 'PLATINUM',
          name: 'Platinum',
          value: Number(metals.platinum),
        },
        {
          symbol: 'PALLADIUM',
          name: 'Palladium',
          value: Number(metals.palladium),
        },
      ];

      /*
       * =====================================================
       * 6. ПРЕСМЕТУВАМЕ CHANGE
       * =====================================================
       */

      const recordsToSave = latestMetals.map((metal) => {
        const current = Number(metal.value);

        const previous = previousMap.get(metal.symbol);

        let change = 0;
        let changePercent = 0;

        /*
         * Ако постои претходна вредност,
         * ја пресметуваме разликата.
         */

        if (
          previous !== undefined &&
          Number.isFinite(previous)
        ) {
          change = Number(
            (current - previous).toFixed(4),
          );

          if (previous !== 0) {
            changePercent = Number(
              ((change / previous) * 100).toFixed(3),
            );
          }
        }

        return {
          symbol: metal.symbol,
          name: metal.name,
          value: current,
          change,
          changePercent,
        };
      });

      this.logger.log(
        `New metals: ${JSON.stringify(recordsToSave)}`,
      );

      /*
       * =====================================================
       * 7. SAVE
       * =====================================================
       *
       * Секој API update создава нови 4 записи.
       */

      await this.metalRepository.save(recordsToSave);

      /*
       * =====================================================
       * 8. ЗЕМАМЕ ГИ НОВИТЕ ЗАПИСИ ОД БАЗА
       * =====================================================
       */

      const inserted = await this.getLatestRecords();

      /*
       * =====================================================
       * 9. RETURN DTO
       * =====================================================
       */

      return inserted.map((metal) =>
        this.toDto(metal),
      );
    } catch (err: any) {
      this.logger.error(
        'Metals API error:',
      );

      this.logger.error(
        err.response?.data,
      );

      this.logger.error(
        err.response?.status,
      );

      this.logger.error(
        err.message,
      );

      throw new HttpException(
        'Unable to fetch metals.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /*
   * =======================================================
   * GET LATEST RECORD FOR EACH METAL
   * =======================================================
   */

  private async getLatestRecords(): Promise<Metal[]> {
    const records = await this.metalRepository.find({
      order: {
        timestamp: 'DESC',
        id: 'DESC',
      },
    });

    const latestBySymbol = new Map<string, Metal>();

    for (const record of records) {
      if (!latestBySymbol.has(record.symbol)) {
        latestBySymbol.set(
          record.symbol,
          record,
        );
      }
    }

    return Array.from(
      latestBySymbol.values(),
    ).sort((a, b) =>
      a.symbol.localeCompare(b.symbol),
    );
  }

  /*
   * =======================================================
   * ENTITY -> DTO
   * =======================================================
   */

  private toDto(metal: Metal): MetalDto {
    const change = Number(metal.change);
    const changePercent = Number(
      metal.changePercent,
    );

    let trend = '⏸️ No change detected';

    if (change > 0) {
      trend = '📈 Rise during the day';
    } else if (change < 0) {
      trend = '📉 Fall during the day';
    }

    return {
      symbol: metal.symbol,
      name: metal.name,
      value: Number(metal.value),

      change,
      changePercent,

      trend,

      timestamp: metal.timestamp.toISOString(),
    };
  }

  async getHistoryBySymbol(symbol: string): Promise<MetalDto[]> {
  const records = await this.metalRepository.find({
    where: {
      symbol: symbol.toUpperCase(),
    },
    order: {
      timestamp: 'ASC',
      id: 'ASC',
    },
  });

  return records.map((metal, index) => {
    const current = Number(metal.value);

    const previous =
      index > 0
        ? Number(records[index - 1].value)
        : undefined;

    const change =
      previous !== undefined
        ? Number((current - previous).toFixed(4))
        : 0;

    const changePercent =
      previous !== undefined && previous !== 0
        ? Number(((change / previous) * 100).toFixed(3))
        : 0;

    let trend = '⏸️ No change detected';

    if (change > 0) {
      trend = '📈 Rise';
    } else if (change < 0) {
      trend = '📉 Fall';
    }

    return {
      symbol: metal.symbol,
      name: metal.name,
      value: current,
      change,
      changePercent,
      trend,
      timestamp: metal.timestamp.toISOString(),
    };
  });
}

}