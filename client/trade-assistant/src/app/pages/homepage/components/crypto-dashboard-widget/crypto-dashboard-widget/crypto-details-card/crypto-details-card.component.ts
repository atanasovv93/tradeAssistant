import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  CryptoService,
  CryptoTrend,
  BinanceTrade,
} from '../../../../../../services/binance/binance.service';

import { FIXED_BASES } from '../../../../../../services/binance/crypto-assets.config';
import { CryptoChartComponent } from '../../../../../../components/crypto-chart/crypto-chart.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-crypto-details-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CryptoChartComponent,
  ],
  templateUrl: './crypto-details-card.component.html',
  styleUrls: ['./crypto-details-card.component.scss'],
})
export class CryptoDetailsCardComponent implements OnInit, OnDestroy {
  private readonly cryptoService = inject(CryptoService);
  private readonly location = inject(Location);

  // Available cryptocurrencies
  readonly coins = Object.entries(FIXED_BASES).map(([symbol, data]) => ({
    symbol: `${symbol}USDT`,
    name: data.name,
    icon: data.icon,
  }));

  // WebSocket subscriptions
  private cryptoSub?: Subscription;
  private tradesSub?: Subscription;

  // Selected cryptocurrency
  selectedSymbol = 'BTCUSDT';

  // Live 24-hour market data
  trend: CryptoTrend | null = null;

  // Recent trades
  trades: BinanceTrade[] = [];

  buyTrades: BinanceTrade[] = [];

  sellTrades: BinanceTrade[] = [];

  ngOnInit(): void {
    this.loadCoinData(this.selectedSymbol);
  }

  /**
   * Navigate back to the previous page.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Change the selected cryptocurrency.
   * The chart receives the new symbol through @Input().
   */
  loadCoin(symbol: string): void {
    if (!symbol || symbol === this.selectedSymbol) {
      return;
    }

    this.selectedSymbol = symbol;

    this.loadCoinData(symbol);
  }

  /**
   * Load live Binance ticker and trade data.
   */
  private loadCoinData(symbol: string): void {
    // Unsubscribe from previous streams
    this.cryptoSub?.unsubscribe();
    this.tradesSub?.unsubscribe();

    // Reset data for the selected cryptocurrency
    this.trend = null;
    this.trades = [];
    this.buyTrades = [];
    this.sellTrades = [];

    // Subscribe to 24-hour ticker
    this.cryptoSub = this.cryptoService
      .get24hTrend(symbol)
      .subscribe({
        next: (data: CryptoTrend) => {
          this.trend = data;
        },
        error: (error: unknown) => {
          console.error('Crypto WebSocket error:', error);
        },
      });

    // Subscribe to real-time trades
    this.tradesSub = this.cryptoService
      .getRecentTrades(symbol)
      .subscribe({
        next: (trade: BinanceTrade) => {
          this.trades = [
            trade,
            ...this.trades,
          ].slice(0, 20);

          if (trade.side === 'BUY') {
            this.buyTrades = [
              trade,
              ...this.buyTrades,
            ].slice(0, 10);
          } else {
            this.sellTrades = [
              trade,
              ...this.sellTrades,
            ].slice(0, 10);
          }
        },
        error: (error: unknown) => {
          console.error('Trades WebSocket error:', error);
        },
      });
  }

  /**
   * Average quote volume per trade over the last 24 hours.
   */
  get averageTradeSize(): number {
    if (!this.trend || this.trend.trades === 0) {
      return 0;
    }

    return this.trend.quoteVolume / this.trend.trades;
  }

  /**
   * Clean up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.cryptoSub?.unsubscribe();
    this.tradesSub?.unsubscribe();
  }
}