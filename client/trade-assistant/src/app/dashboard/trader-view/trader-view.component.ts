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
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly cryptoService = inject(CryptoService);

  private cryptoSub?: Subscription;

  selectedSymbol = 'BTCUSDT';

  trend: CryptoTrend | null = null;

  readonly coins = FIXED_BASES;

  ngOnInit(): void {
    this.loadCoinData(this.selectedSymbol);
  }

  ngAfterViewInit(): void {
    this.loadTradingView();
  }

  loadCoin(symbol: string): void {
    this.selectedSymbol = symbol;

    this.loadCoinData(symbol);

    setTimeout(() => {
      this.loadTradingView();
    }, 0);
  }

  private loadCoinData(symbol: string): void {
    this.cryptoSub?.unsubscribe();

    this.trend = null;

    this.cryptoSub = this.cryptoService
      .get24hTrend(symbol)
      .subscribe({
        next: (data) => {
          this.trend = data;
        },
        error: (error) => {
          console.error('Crypto WebSocket error:', error);
        },
      });
  }

  private loadTradingView(): void {
    const container = document.getElementById('tradingview_chart');

    if (!container) {
      console.warn('TradingView container not found');
      return;
    }

    container.innerHTML = '';

    const script = document.createElement('script');

    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${this.selectedSymbol}`,
      interval: '15',
      timezone: 'Europe/Vienna',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: false,
      support_host: 'https://www.tradingview.com',
    });

    container.appendChild(script);
  }

  get averageTradeSize(): number {
    if (!this.trend || this.trend.trades === 0) {
      return 0;
    }

    return this.trend.quoteVolume / this.trend.trades;
  }

  ngOnDestroy(): void {
    this.cryptoSub?.unsubscribe();
  }
}