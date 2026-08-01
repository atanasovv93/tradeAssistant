/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetalsController } from './metals.controller';
import { MetalsService } from './metals.service';
import { Metal } from './entities/metal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Metal]),
  ],
  controllers: [MetalsController],
  providers: [MetalsService],
})
export class MetalsModule {}