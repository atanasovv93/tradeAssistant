import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { interval, switchMap, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../../../services/binance/binance.service';
import { LoadingSpinnerComponent } from '../../../../shared/loading-spinner/loading-spinner.component';
import { LanguageService } from '../../../../services/language/language.service';

@Component({
  selector: 'app-crypto-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './crypto-dashboard-widget.component.html',
  styleUrls: ['./crypto-dashboard-widget.component.scss'],
})
export class CryptoDashboardWidgetComponent implements OnInit, OnDestroy {

  private readonly cryptoService = inject(CryptoService);
  private readonly languageService = inject(LanguageService);
  private refreshSub!: Subscription;

  readonly fixedBases : Record<string, { name: string; icon: string }> = {
  BTC: {
    name: 'Bitcoin',
    icon: 'https://banner2.cleanpng.com/20180330/zdq/kisspng-free-bitcoin-computer-icons-bitcoin-5abdfe8b455c60.1048406415224009072841.jpg'
  },
  ETH: {
    name: 'Ethereum',
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9BdemyVeuZZe931PFBYxnXq_QWDV3vLmMkmahl5GuHMtWLyC1HRxkbiT9&s=10'
  },
  BNB: {
    name: 'BNB',
    icon: 'https://banner2.cleanpng.com/20240304/elk/transparent-cryptocurrency-logo-company-logo-yellow-square-whi-yellow-square-with-white-triangle-logo-1710851467078.webp'
  },
  SOL: {
    name: 'Solana',
    icon: 'https://pngdownloads.wordpress.com/wp-content/uploads/2024/03/solana-sol-black-logo-png.jpg?w=850'
  },
  LTC: {
    name: 'Litecoin',
    icon: 'https://icon2.cleanpng.com/20180701/hwb/kisspng-litecoin-computer-icons-cryptocurrency-stellar-bit-litecoin-5b38aa2e4fdd48.5189667315304402383271.jpg'
  },
  ADA: {
    name: 'Cardano',
    icon: 'https://toppng.com/uploads/preview/cardano-logo-11552763966venp8i53za.png'
  },
  XRP: {
    name: 'XRP',
    icon: 'https://w7.pngwing.com/pngs/192/349/png-transparent-xrp-symbol-xrp-sign-xrp-logo-xrp-crypto-xrp-coin-xrp-3d-icon-thumbnail.png'
  },
  AXS: {
    name: 'Axie Infinity',
    icon: 'https://png.pngtree.com/png-clipart/20211214/ourmid/pngtree-3d-rendering-cryptocurrency-axie-infinity-blue-coin-with-cartoon-style-png-image_4056964.png'
  },
  SPCXB: {
    name: 'SPCXB Token',
    icon: 'https://coin-images.coingecko.com/coins/images/102173888/large/bstocks_spacex.png?1781280362'
  },
  NVDAB: {
    name: 'NVDAB',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo-nvidia-transparent-PNG.png'
  }
};

  latest = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  Math = Math;

  ngOnInit(): void {
    this.loadRates();

    this.refreshSub = interval(5000)
      .pipe(
        switchMap(() => this.cryptoService.getMultiple24hTrends(
          Object.keys(this.fixedBases).map(s => s + 'USDT')
        ))
      )
      .subscribe({
        next: (res) => {
          const filtered = res.trends.map(t => {

  const symbol = t.symbol.replace('USDT', '');

  return {
    symbol,
    name: this.fixedBases[symbol]?.name ?? symbol,
    icon: this.fixedBases[symbol]?.icon ?? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9BdemyVeuZZe931PFBYxnXq_QWDV3vLmMkmahl5GuHMtWLyC1HRxkbiT9&s=10',
    value: t.close,
    trend: t.trend,
    changePercent: t.priceChangePercent,
  };

});

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
      Object.keys(this.fixedBases).map(s => s + 'USDT')
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
        this.error.set(this.currentLanguage === 'DE'
    ? 'Kurse können momentan nicht geladen werden.'
    : 'Cannot load rates at the moment.'
);

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

  get currentLanguage(): 'EN' | 'DE' {
  return this.languageService.getLanguage();
}

}
