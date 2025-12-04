import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { interval, switchMap, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../services/binance/binance.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component.js';
@Component({
  selector: 'app-crypto-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './crypto-dashboard-widget.component.html',
  styleUrls: ['./crypto-dashboard-widget.component.scss'],
})
export class CryptoDashboardWidgetComponent implements OnInit, OnDestroy {

  private readonly cryptoService = inject(CryptoService);
  private refreshSub!: Subscription;

  readonly fixedBases = ['BTC', 'ETH', 'BNB', 'SOL', 'LTC', 'ADA', 'AXS'];

  latest = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  Math = Math;

  ngOnInit(): void {
    this.loadRates();

    this.refreshSub = interval(5000)
      .pipe(
        switchMap(() => this.cryptoService.getMultiple24hTrends(
          this.fixedBases.map(s => s + 'USDT')
        ))
      )
      .subscribe({
        next: (res) => {
          const filtered = res.trends.map(t => ({
            symbol: t.symbol,
            value: t.close,
            trend: t.trend,
            changePercent: t.priceChangePercent,
          }));

          this.latest.set(filtered);
        },
        error: () => {
          this.error.set('Cannot load rates at the moment.');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  private loadRates() {
    this.loading.set(true);
    this.error.set(null);

    this.cryptoService.getMultiple24hTrends(
      this.fixedBases.map(s => s + 'USDT')
    ).subscribe({
      next: (res) => {
        const filtered = res.trends.map(t => ({
          symbol: t.symbol,
          value: t.close,
          trend: t.trend,
          changePercent: t.priceChangePercent,
        }));
        this.latest.set(filtered);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Cannot load rates at the moment.');
        this.loading.set(false);
      }
    });
  }

  getFormattedDate(): string {
    const now = new Date();
    return now.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
