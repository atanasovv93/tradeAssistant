/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { ForexAnalysisService } from '../forexRate/forex-analysis.service';
import { CryptoAnalysisService } from '../binance/services/analysis/crypto-analysis.service';
import { CreateNewsDto } from '../dto/news/create-article.dto';

@Injectable()
export class NewsPublishService {
    private readonly logger = new Logger(NewsPublishService.name);

    constructor(
        private readonly newsService: NewsService,
        private readonly forexAnalysisService: ForexAnalysisService,
        private readonly cryptoAnalysisService: CryptoAnalysisService,
    ) {}

    /**
     * 🟦 Daily Forex Article — published every morning at 08:00
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

            const contentLines = analysis.trends.map(t => {
                return `${t.currency}: Start ${t.start.toFixed(3)}, Mid ${t.mid.toFixed(3)}, End ${t.end.toFixed(3)}, Change ${t.dailyChange.toFixed(3)}% ${t.trend}`;
            });

            const news: CreateNewsDto = {
                title: `Forex Daily Analysis - ${todaysDate}`,
                content: contentLines.join('\n\n'),
                image: 'https://images.ctfassets.net/hzjmpv1aaorq/2GG2BaOtWnvcy0odw5QseF/59984c27d5c432170cc7a37b72d6d4b4/Untitled_design__13_.png?q=70',
                author: 'Forex Analysis Bot',
                category: 'Forex Daily Analysis',
            };

            await this.newsService.create(news);
            this.logger.log(`✅ Forex analysis news published`);

            return true;
        } catch (error) {
            this.logger.error(`❌ Error publishing daily Forex article: ${error}`);
            return false;
        }
    }

    /**
     * 🟪 Daily Crypto Article — published every morning at 08:05
     */
    @Cron('5 8 * * *')
    async publishDailyCryptoAnalysis(): Promise<boolean> {
        try {
            const analyzer: any = this.cryptoAnalysisService as any;
            if (typeof analyzer.analyzeDailyTrends !== 'function') {
                this.logger.warn('⚠️ CryptoAnalysisService.analyzeDailyTrends is not available.');
                return false;
            }

            const analysis = await analyzer.analyzeDailyTrends();

            if (!analysis || !analysis.trends?.length) {
                this.logger.warn('⚠️ Not enough Crypto data for publishing.');
                return false;
            }

            const todaysDate = new Date().toLocaleDateString();

            const contentLines = analysis.trends.map(t => {
                return `${t.symbol}: Open ${t.open}, Mid ${t.mid}, Close ${t.close}, Change ${t.change}% ${t.trend}`;
            });

            const news: CreateNewsDto = {
                title: `Crypto Market Daily Analysis - ${todaysDate}`,
                content: contentLines.join('\n\n'),
                image: 'https://i.ibb.co/5T3gN6p/crypto-analysis.png',
                author: 'Crypto Analysis Bot',
                category: 'Crypto Daily Analysis',
            };

            await this.newsService.create(news);
            this.logger.log(`✅ Crypto analysis news published`);

            return true;
        } catch (error) {
            this.logger.error(`❌ Error publishing daily Crypto analysis: ${error}`);
            return false;
        }
    }
}
