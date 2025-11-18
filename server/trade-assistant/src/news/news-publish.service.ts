/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { ForexAnalysisService } from '../forexRate/forex-analysis.service';
import { CreateNewsDto } from '../dto/news/create-article.dto';

@Injectable()
export class NewsPublishService {
    private readonly logger = new Logger(NewsPublishService.name);

    constructor(
        private readonly newsService: NewsService,
        private readonly forexAnalysisService: ForexAnalysisService,
    ) { }

    @Cron('0 8 * * *')
    async publishDailyForexAnalysis(): Promise<boolean> {
        try {
            const analysis = await this.forexAnalysisService.analyzeDailyTrends();

            if (!analysis || !analysis.trends?.length) {
                this.logger.warn(
                    '⚠️ Нема доволно податоци за дневна анализа денес. News не е објавено.',
                );
                return false;
            }

            const todaysDate = new Date().toLocaleDateString();

            const contentLines = analysis.trends.map(t => {
                const start = t.start.toFixed(3);
                const mid = t.mid.toFixed(3);
                const end = t.end.toFixed(3);
                const change = t.dailyChange.toFixed(3);
                return `${t.currency}: Start ${start}, Mid ${mid}, End ${end}, Change ${change}% ${t.trend}`;
            });

            const news: CreateNewsDto = {
                title: `Анализа на валутите во однос со Американскиот Долар, ден ${todaysDate}`,
                content: contentLines.join('\n\n'),
                image: 'https://images.ctfassets.net/hzjmpv1aaorq/2GG2BaOtWnvcy0odw5QseF/59984c27d5c432170cc7a37b72d6d4b4/Untitled_design__13_.png?q=70',
                author: 'AutoForexBot',
                category: 'Forex Дневна Анализа',
            };


            await this.newsService.create(news);
            this.logger.log(`✅ Forex analysis news published`);
            return true;
        } catch (error) {
            this.logger.error(
                '❌ Error publishing daily Forex analysis:',
                error instanceof Error ? error.message : JSON.stringify(error),
            );
            return false; 
        }
    }
}
