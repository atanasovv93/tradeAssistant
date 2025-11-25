/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { CryptoMarketService } from '../services/crypto-market.service';
import { CryptoAnalysisService } from '../services/analysis/crypto-analysis.service';

@Controller('crypto')
export class CryptoController {
    constructor(private readonly cryptoService: CryptoMarketService, private readonly cryptoAnalysisService: CryptoAnalysisService,) { }

    @Get('sync')
    async syncAll() {
        return this.cryptoService.syncDaily();
    }

    @Get('history/:symbol')
    async getHistory(@Param('symbol') symbol: string) {
        return this.cryptoService.getHistory(symbol.toUpperCase());
    }

    @Get('analysis/:symbol')
    async analyze(@Param('symbol') symbol: string) {
        return this.cryptoAnalysisService.analyze(symbol);
    }

}
