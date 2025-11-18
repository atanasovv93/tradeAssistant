/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ForexRateService } from './forex-rate.service';
import { ForexRate } from './entities/forex-rate.entity';

interface DailyTrend {
  currency: string;
  start: number;
  mid: number;
  end: number;
  dailyChange: number;
  trend: string;
}

export interface DailyAnalysis {
  base: string;
  from: Date;
  to: Date;
  trends: DailyTrend[];
}

@Injectable()
export class ForexAnalysisService {
    private readonly logger = new Logger(ForexAnalysisService.name);

    constructor(private readonly forexRateService: ForexRateService) { }

    async analyzeDailyTrends(): Promise<DailyAnalysis | null> {
        const records: ForexRate[] = await this.forexRateService.findAll();
        records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (records.length < 3) {
            this.logger.warn('Нема доволно податоци за дневна анализа (потребни се 3 фетча).');
            return null;
        }

        const [latest, mid, first] = records.slice(0, 3);

        const trends: DailyTrend[] = Object.keys(latest.rates).map(currency => {
            const start = first.rates[currency];
            const midt = mid.rates[currency];
            const end = latest.rates[currency];
            const change = ((end - start) / start) * 100;

            return {
                currency,
                start,
                mid: midt,
                end,
                dailyChange: Number(change.toFixed(3)),
                trend: change > 0 ? '📈 Раст во текот на денот'
                     : change < 0 ? '📉 Пад во текот на денот'
                     : '⏸️ Без промена',
            };
        });

        return {
            base: latest.base,
            from: first.createdAt,
            to: latest.createdAt,
            trends,
        };
    }
}
