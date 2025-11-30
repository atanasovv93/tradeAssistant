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

  // закучани симболи (секогаш достапни)
  readonly fixedBases = ['BTC', 'ADA'];

  // state
  latest = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRates();
  }

  private loadRates() {
    this.loading.set(true);
    this.error.set(null);

    // земи trends од daily-trends API
    this.cryptoService.getDailyTrends().subscribe({
      next: (res) => {
        // филтрираме само заклучаните симболи
        const filtered = res.trends
          .filter(t => this.fixedBases.includes(t.symbol.replace('USDT', '')))
          .map(t => ({
            symbol: t.symbol,
            value: t.close, // или t.mid ако сакаш средна цена
            trend: t.trend,
          }));

        this.latest.set(filtered);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Не можам да ги вчитам курсевите моментално.');
        this.loading.set(false);
      },
    });
  }

  getFormattedDate(): string {
    return new Date().toLocaleString();
  }
}
