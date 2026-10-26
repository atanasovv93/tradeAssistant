import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  ChartConfiguration,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import { Subscription } from 'rxjs';

import {
  CryptoService,
  CryptoTrend,
  BinanceTrade,
} from '../../services/binance/binance.service';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-crypto-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './crypto-chart.component.html',
  styleUrl: './crypto-chart.component.scss',
})
export class CryptoChartComponent
  implements OnInit, OnChanges, OnDestroy {

  private readonly cryptoService = inject(CryptoService);

  private tickerSubscription?: Subscription;
  private tradesSubscription?: Subscription;
  private initialized = false;

  @Input() symbol = 'BTCUSDT';

  selectedSymbol = 'BTCUSDT';
  currentPrice = 0;
  priceChangePercent = 0;
  loading = true;
  error = '';

  // Session statistics
  sessionTrades = 0;
  sessionVolume = 0;
  sessionQuoteVolume = 0;
  buyVolume = 0;
  sellVolume = 0;

  sessionHigh = 0;
  sessionLow = 0;
  sessionStartPrice = 0;
  sessionChangePercent = 0;

  lastTrade?: BinanceTrade;

  private readonly maxPoints = 300;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Price (USDT)',
        data: [],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.12)',
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,

    interaction: {
      intersect: false,
      mode: 'index',
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        type: 'category',
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 6,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.12)',
        },
      },

      y: {
        type: 'linear',
        position: 'right',
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.12)',
        },
      },
    },
  };

  ngOnInit(): void {
    this.initialized = true;
    this.connectToSymbol(this.symbol);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const symbolChange = changes['symbol'];

    if (
      this.initialized &&
      symbolChange &&
      this.symbol &&
      this.symbol !== this.selectedSymbol
    ) {
      this.connectToSymbol(this.symbol);
    }
  }

  connectToSymbol(symbol: string): void {
    if (!symbol) {
      return;
    }

    // Stop previous symbol streams
    this.tickerSubscription?.unsubscribe();
    this.tradesSubscription?.unsubscribe();

    this.selectedSymbol = symbol;
    this.currentPrice = 0;
    this.priceChangePercent = 0;
    this.loading = true;
    this.error = '';

    // Reset session statistics
    this.sessionTrades = 0;
    this.sessionVolume = 0;
    this.sessionQuoteVolume = 0;
    this.buyVolume = 0;
    this.sellVolume = 0;

    this.sessionHigh = 0;
    this.sessionLow = 0;
    this.sessionStartPrice = 0;
    this.sessionChangePercent = 0;
    this.lastTrade = undefined;

    // Reset chart data
    this.lineChartData = {
      ...this.lineChartData,
      labels: [],
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: [],
        },
      ],
    };

    // Stream 1: 24-hour ticker
    this.tickerSubscription = this.cryptoService
      .get24hTrend(symbol)
      .subscribe({
        next: (trend: CryptoTrend) => {
          const price = Number(trend.close);

          if (!Number.isFinite(price) || price <= 0) {
            return;
          }

          this.currentPrice = price;

          this.priceChangePercent =
            Number(trend.priceChangePercent) || 0;

          if (this.sessionStartPrice === 0) {
            this.sessionStartPrice = price;
          }

          this.sessionChangePercent =
            ((price - this.sessionStartPrice) /
              this.sessionStartPrice) *
            100;

          this.loading = false;
        },

        error: (error: unknown) => {
          console.error('[CryptoChart] Ticker error:', error);

          this.error =
            'Не може да се поврзе со Binance ticker.';

          this.loading = false;
        },
      });

    // Stream 2: individual trades
    this.tradesSubscription = this.cryptoService
      .getRecentTrades(symbol)
      .subscribe({
        next: (trade: BinanceTrade) => {
          const price = Number(trade.price);
          const quantity = Number(trade.quantity);

          if (
            !Number.isFinite(price) ||
            price <= 0 ||
            !Number.isFinite(quantity) ||
            quantity <= 0
          ) {
            return;
          }

          // Update current price and chart using the actual trade price
          this.currentPrice = price;
          this.addPricePoint(price);

          this.lastTrade = trade;
          this.sessionTrades++;

          // Volume in base asset, e.g. BTC
          this.sessionVolume += quantity;

          // Volume in quote asset, e.g. USDT
          this.sessionQuoteVolume += price * quantity;

          if (trade.side === 'BUY') {
            this.buyVolume += quantity;
          } else {
            this.sellVolume += quantity;
          }

          // Session high and low
          if (this.sessionHigh === 0) {
            this.sessionHigh = price;
            this.sessionLow = price;
          } else {
            this.sessionHigh = Math.max(
              this.sessionHigh,
              price,
            );

            this.sessionLow = Math.min(
              this.sessionLow,
              price,
            );
          }

          // Initialize session start price
          if (this.sessionStartPrice === 0) {
            this.sessionStartPrice = price;
          }

          if (this.sessionStartPrice > 0) {
            this.sessionChangePercent =
              ((price - this.sessionStartPrice) /
                this.sessionStartPrice) *
              100;
          }

          // Ensure the chart becomes visible when trades arrive
          this.loading = false;
        },

        error: (error: unknown) => {
          console.error('[CryptoChart] Trades error:', error);
        },
      });
  }

  private addPricePoint(price: number): void {
    const labels = [
      ...(this.lineChartData.labels as string[]),
    ];

    const values = [
      ...(this.lineChartData.datasets[0].data as number[]),
    ];

    const timestamp = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    labels.push(timestamp);
    values.push(price);

    // Keep only the latest 300 points
    if (labels.length > this.maxPoints) {
      labels.shift();
      values.shift();
    }

    this.lineChartData = {
      ...this.lineChartData,
      labels,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: [...values],
        },
      ],
    };
  }

  ngOnDestroy(): void {
    this.tickerSubscription?.unsubscribe();
    this.tradesSubscription?.unsubscribe();
  }
}
