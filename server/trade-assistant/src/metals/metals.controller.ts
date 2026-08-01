/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { MetalsService } from './metals.service';

@Controller('metals')
export class MetalsController {

  constructor(
    private readonly metalsService: MetalsService,
  ) {}

  @Get('latest')
  async latest() {
    return this.metalsService.getLatest();
  }

}