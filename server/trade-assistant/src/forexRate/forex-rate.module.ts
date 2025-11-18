import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForexRateService } from './forex-rate.service';
import { ForexRateController } from './forex-rate.controller';
import { ForexRate } from './entities/forex-rate.entity';
import { ForexFetchService } from './forex-fetch.service';
import { ForexAnalysisService } from './forex-analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([ForexRate])],
  controllers: [ForexRateController],
  providers: [ForexRateService, ForexFetchService, ForexAnalysisService],
  exports: [ForexRateService, ForexAnalysisService],
})
export class ForexRateModule {}
