/* eslint-disable prettier/prettier */
 
 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsPublishService } from './news-publish.service';
import { News } from '../entities/news.entity';
import { ForexRateModule } from '../forexRate/forex-rate.module';
import { BinanceModule } from '../binance/services/binance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    ScheduleModule.forRoot(),
    ForexRateModule,
    BinanceModule,           
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsPublishService],
  exports: [NewsService],
})
export class NewsModule {}
