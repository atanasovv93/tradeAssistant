/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { ForexAnalysisService } from '../forexRate/forex-analysis.service';
import { CryptoAnalysisService } from '../binance/services/crypto-analysis.service';
import { CreateNewsDto } from '../dto/news/create-article.dto';

@Injectable()
export class NewsPublishService {
    private readonly logger = new Logger(NewsPublishService.name);

    constructor(
        private readonly newsService: NewsService,
        private readonly forexAnalysisService: ForexAnalysisService,
        private readonly cryptoDailyAnalysisService: CryptoAnalysisService,
    ) { }

    /**
     * 🟦 Daily Forex Article — 08:00
     */
    @Cron('0 8 * * *')
    async publishDailyForexAnalysis(): Promise<boolean> {
        try {
            const analysis = await this.forexAnalysisService.analyzeDailyTrends();

            if (!analysis || !analysis.trends?.length) {
                this.logger.warn('⚠️ Not enough Forex data for publishing.');
                return false;
            }

            const todaysDate = new Date().toLocaleDateString();

            const contentLines = analysis.trends.map((t) => {
                return `${t.currency}: Start ${t.start.toFixed(
                    3,
                )}, Mid ${t.mid.toFixed(3)}, End ${t.end.toFixed(
                    3,
                )}, Change ${t.dailyChange.toFixed(3)}% ${t.trend}`;
            });

            const news: CreateNewsDto = {
                title: `Forex Daily Analysis - ${todaysDate}`,
                content: contentLines.join('\n\n'),
                image:
                    'https://images.ctfassets.net/hzjmpv1aaorq/2GG2BaOtWnvcy0odw5QseF/59984c27d5c432170cc7a37b72d6d4b4/Untitled_design__13_.png?q=70',
                author: 'Forex Analysis Bot',
                category: 'Forex Daily Analysis',
            };

            await this.newsService.create(news);
            this.logger.log(`✅ Forex analysis news published`);

            return true;
        } catch (error) {
            this.logger.error(
                `❌ Error publishing daily Forex article: ${error}`,
            );
            return false;
        }
    }

    /**
     * 🟪 Daily Crypto Article — 08:05
     */
    @Cron('5 8 * * *')
    async publishDailyCryptoAnalysis(): Promise<boolean> {
        try {
            const analysis = await this.cryptoDailyAnalysisService.analyzeDailyTrends();

            if (!analysis || !analysis.trends?.length) {
                this.logger.warn('⚠️ Not enough Crypto data for publishing.');
                return false;
            }

            const todaysDate = new Date().toLocaleDateString();

            const contentLines = analysis.trends.map(t => {
                const midText = t.mid == null ? 'N/A' : t.mid;
                return `${t.symbol}: Open ${t.open}, Mid ${midText}, Close ${t.close}, Change ${t.change}% ${t.trend}`;
            });


            const news: CreateNewsDto = {
                title: `Crypto Market Daily Analysis - ${todaysDate}`,
                content: contentLines.join('\n\n'),
                image:
                    'https://images.ctfassets.net/hzjmpv1aaorq/2GG2BaOtWnvcy0odw5QseF/59984c27d5c432170cc7a37b72d6d4b4/Untitled_design__13_.png?q=70',
                author: 'Crypto Analysis Bot',
                category: 'Crypto Daily Analysis',
            };

            await this.newsService.create(news);
            this.logger.log(`✅ Crypto analysis news published`);

            return true;
        } catch (error) {
            this.logger.error(
                `❌ Error publishing daily Crypto analysis: ${error}`,
            );
            return false;
        }
    }
}
