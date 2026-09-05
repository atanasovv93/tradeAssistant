import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { CryptoService } from '../../../../services/binance/binance.service';
import { LoadingSpinnerComponent } from '../../../../shared/loading-spinner/loading-spinner.component';
import { LanguageService } from '../../../../services/language/language.service';
import { CryptoDashboardInterface } from './interfaces/crypto-dashboard.interface';
import { FIXED_BASES } from '../../../../services/binance/crypto-assets.config';

@Component({
  selector: 'app-crypto-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './crypto-dashboard-widget.component.html',
  styleUrls: ['./crypto-dashboard-widget.component.scss'],
})
export class CryptoDashboardWidgetComponent
  implements OnInit, OnDestroy
{
  private readonly cryptoService = inject(CryptoService);
  private readonly languageService = inject(LanguageService);

  private refreshSub?: Subscription;

readonly fixedBases = FIXED_BASES;    

  latest = signal<CryptoDashboardInterface[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  Math = Math;

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.refreshSub = this.cryptoService
      .getMultiple24hTrends(
        Object.keys(this.fixedBases).map((s) => `${s}USDT`)
      )
      .subscribe({
        next: (res) => {
          const filtered: CryptoDashboardInterface[] = res.trends.map((t) => {
            const symbol = t.symbol.replace('USDT', '');
            const trendData = t as unknown as {
              open?: number;
              high?: number;
              low?: number;
              volume?: number;
              trades?: number;
              bid?: number;
              ask?: number;
              spread?: number;
            };

            return {
  symbol,
  name: this.fixedBases[symbol]?.name ?? symbol,
  icon:
    this.fixedBases[symbol]?.icon ??
    'https://...',

  value: t.close,

  open: t.open,
  high: t.high,
  low: t.low,

  trend: t.trend,
  change: t.change,
  changePercent: t.priceChangePercent,

  volume: t.volume,
  quoteVolume: t.quoteVolume,
  trades: t.trades,

  bid: t.bid,
  ask: t.ask,
  spread: t.spread,
};
          });

          this.latest.set(filtered);
          this.loading.set(false);
        },

        error: () => {
          this.error.set(
            this.currentLanguage === 'DE'
              ? 'Kurse können momentan nicht geladen werden.'
              : 'Cannot load rates at the moment.'
          );

          this.loading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  trackBySymbol(
    index: number,
    item: CryptoDashboardInterface
  ): string {
    return item.symbol;
  }

  getFormattedDate(): string {
    return new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  get currentLanguage(): 'EN' | 'DE' {
    return this.languageService.getLanguage();
  }
}
