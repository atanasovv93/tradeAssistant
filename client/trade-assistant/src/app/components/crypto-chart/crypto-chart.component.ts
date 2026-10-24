
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
} from '../../services/binance/binance.service';

// Register Chart.js components required for the line chart.
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
  private subscription?: Subscription;
  private initialized = false;

  @Input() symbol = 'BTCUSDT';

  selectedSymbol = 'BTCUSDT';
  currentPrice = 0;
  priceChangePercent = 0;
  loading = true;
  error = '';

  private readonly maxPoints = 60;

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

    this.subscription?.unsubscribe();

    this.selectedSymbol = symbol;
    this.currentPrice = 0;
    this.priceChangePercent = 0;
    this.loading = true;
    this.error = '';

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

    this.subscription = this.cryptoService
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

          const labels = [
            ...(this.lineChartData.labels as string[]),
          ];

          const values = [
            ...(this.lineChartData.datasets[0].data as number[]),
          ];

          labels.push(
            new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          );

          values.push(price);

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

          this.loading = false;
        },
        error: (error: unknown) => {
          console.error(
            '[CryptoChart] WebSocket/service error:',
            error,
          );

          this.error =
            'Не може да се поврзе со Binance WebSocket.';

          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
