/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../services/binance/binance.service';

@Component({
  selector: 'app-crypto-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crypto-dashboard-widget.component.html',
  styleUrls: ['./crypto-dashboard-widget.component.scss'],
})
export class CryptoDashboardWidgetComponent implements OnInit {
private readonly cryptoService = inject(CryptoService);

  // заклучани симболи (секогаш достапни)
  readonly fixedBases = ['BTC',  'ETH', 'BNB', 'SOL', 'LTC', 'ADA', 'AXS'];

  // state
  latest = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRates(); // повик на методот за вчитување на rates
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
          trend: t.trend
        }));
        this.latest.set(filtered);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.error.set('Не можам да ги вчитам курсевите моментално.');
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
