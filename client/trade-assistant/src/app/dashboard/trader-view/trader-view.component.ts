import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  CryptoService,
  CryptoTrend,
  BinanceTrade,
} from '../../services/binance/binance.service';

import { FIXED_BASES } from '../../services/binance/crypto-assets.config';

@Component({
  selector: 'app-trader-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trader-view.component.html',
  styleUrl: './trader-view.component.scss',
})
export class TraderViewComponent
  implements OnInit, AfterViewInit, OnDestroy {
  private readonly cryptoService = inject(CryptoService);

  // Available coins
  readonly coins = Object.entries(FIXED_BASES).map(([symbol, data]) => ({
    symbol: `${symbol}USDT`,
    name: data.name,
    icon: data.icon,
  }));

  // WebSocket subscriptions
  private cryptoSub?: Subscription;
  private tradesSub?: Subscription;

  // Selected coin
  selectedSymbol = 'BTCUSDT';

  // Live 24h market data
  trend: CryptoTrend | null = null;

  // Last 10 trades
  trades: BinanceTrade[] = [];

  buyTrades: BinanceTrade[] = [];

  sellTrades: BinanceTrade[] = [];

  ngOnInit(): void {
    this.loadCoinData(this.selectedSymbol);
  }

  ngAfterViewInit(): void {
    this.loadTradingView();
  }

  /**
   * Change selected coin
   */
  loadCoin(symbol: string): void {
    this.selectedSymbol = symbol;

    this.loadCoinData(symbol);

    // Reload TradingView with the new symbol
    setTimeout(() => {
      this.loadTradingView();
    }, 0);
  }

  /**
   * Load live Binance data
   */
  private loadCoinData(symbol: string): void {
    // Close previous WebSocket connections
    this.cryptoSub?.unsubscribe();
    this.tradesSub?.unsubscribe();

    // Reset data
    this.trend = null;
    this.trades = [];
    this.buyTrades = [];
    this.sellTrades = [];

    /**
     * 24h ticker
     */
    this.cryptoSub = this.cryptoService
      .get24hTrend(symbol)
      .subscribe({
        next: (data) => {
          this.trend = data;
        },

        error: (error) => {
          console.error(
            'Crypto WebSocket error:',
            error
          );
        },
      });

    /**
     * Real-time trades
     */
    this.tradesSub = this.cryptoService
  .getRecentTrades(symbol)
  .subscribe({
    next: (trade) => {

      this.trades = [trade, ...this.trades].slice(0, 20);

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

    error: (error) => {
      console.error('Trades WebSocket error:', error);
    },
  });
  }

  /**
   * Load TradingView chart
   */
  private loadTradingView(): void {
    const container =
      document.getElementById('tradingview_chart');

    if (!container) {
      console.warn(
        'TradingView container not found'
      );
      return;
    }

    // Remove previous chart
    container.innerHTML = '';

    const script =
      document.createElement('script');

    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,

      symbol:
        `BINANCE:${this.selectedSymbol}`,

      // Daily candles
      interval: '1D',

      timezone: 'Europe/Vienna',

      theme: 'dark',

      style: '1',

      locale: 'en',

      enable_publishing: false,

      allow_symbol_change: false,

      support_host:
        'https://www.tradingview.com',
    });

    container.appendChild(script);
  }

  /**
   * Average trade size
   */
  get averageTradeSize(): number {
    if (
      !this.trend ||
      this.trend.trades === 0
    ) {
      return 0;
    }

    return (
      this.trend.quoteVolume /
      this.trend.trades
    );
  }

  /**
   * Cleanup
   */
  ngOnDestroy(): void {
    this.cryptoSub?.unsubscribe();
    this.tradesSub?.unsubscribe();
  }
}