/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ForexService, ForexRate, ForexTrendItem } from '../../../../services/forex.service/forex.service';
import { LoadingSpinnerComponent } from '../../../../shared/loading-spinner/loading-spinner.component';
import { LanguageService } from '../../../../services/language/language.service';

@Component({
  selector: 'app-forex-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './forex-dashboard-widget.component.html',
  styleUrls: ['./forex-dashboard-widget.component.scss'],
})
export class ForexDashboardWidgetComponent implements OnInit {

  private readonly forexService = inject(ForexService);
  private readonly languageService = inject(LanguageService);

  readonly bases = ['EUR', 'USD', 'GBP', 'CHF', 'AUD', 'CAD', 'MKD', 'TRY','RUB','JPY', 'CNY'];

  readonly currencies: Record<string, {
  name: string;
  icon: string;
}> = {

  EUR: {
    name: 'Euro',
    icon: 'https://static.vecteezy.com/system/resources/thumbnails/012/026/927/small/european-union-flag-with-grunge-texture-png.png'
  },

  USD: {
    name: 'US Dollar',
    icon: 'https://img.magnific.com/premium-vector/grunge-american-flag-design_1102-1923.jpg?semt=ais_hybrid&w=740&q=80'
  },

  GBP: {
    name: 'British Pound',
    icon: 'https://img.magnific.com/premium-psd/brush-flag-united-kingdom-design-transparent-element-united-kingdom-brush-stroke-national-flag_609989-3747.jpg?semt=ais_hybrid&w=740&q=80'
  },

  CHF: {
    name: 'Swiss Franc',
    icon: 'https://png.pngtree.com/png-clipart/20221015/ourmid/pngtree-vintage-switzerland-flag-png-image_6342453.png'
  },

  AUD: {
    name: 'Australian Dollar',
    icon: 'https://png.pngtree.com/png-vector/20210722/ourmid/pngtree-watercolor-or-torn-flag-of-australia-png-image_3626846.jpg'
  },

  CAD: {
    name: 'Canadian Dollar',
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI8MraSVn2FW1r0FGD72YCW2yoJwqYuR7HolIcR4tyxUtQ821Ss3DxnhE&s=10'
  },

  JPY: {
    name: 'Japanese Yen',
    icon: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjkzNy02MC5wbmc.png'
  },

  TRY: {
    name: 'Turkish Lira',
    icon: 'https://static.vecteezy.com/system/resources/previews/021/013/478/non_2x/turkey-flag-with-brush-paint-on-transparent-background-free-png.png'
  },

  RUB: {
    name: 'Russian Ruble',
    icon: 'https://www.citypng.com/public/uploads/preview/download-hd-russia-grunge-flag-png-735811695835771nojbsefqrv.png'
  },

  MKD: {
    name: 'Macedonian Denar',
    icon: 'https://png.pngtree.com/png-clipart/20230303/original/pngtree-macedonia-flag-national-symbol-with-transparent-background-png-image_8971563.png'
  },

  CNY: {
    name: 'Chinese Yuan',
    icon: 'https://img.magnific.com/premium-vector/flag-china-beautiful-strokes-abstract-concept-elements-design_546559-1037.jpg?semt=ais_hybrid&w=740&q=80'
  }

  };


  // Signals (state)
  selectedBase = signal<string>('EUR');
  latest = signal<ForexRate | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  dailyTrends = signal<ForexTrendItem[]>([]);

  ngOnInit(): void {
    this.loadRates();
    this.loadDailyTrends();
  }

  /** Load Forex Rates */
  private loadRates() {
    this.loading.set(true);
    this.error.set(null);

    this.forexService.getLatestByBase(this.selectedBase()).subscribe({
      next: (res: ForexRate) => {
        this.latest.set(res);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.error.set(this.currentLanguage === 'DE'
          ? 'Kurse können momentan nicht geladen werden.'
          : 'Cannot load rates at the moment.'
        );
        this.loading.set(false);
      },
    });
  }

  /** Load Trend Data */
  private loadDailyTrends() {
    this.forexService.getDailyTrends().subscribe({
      next: (res) => {
        this.dailyTrends.set(res.trends);
      },
      error: (err) => console.error('Cannot load trends', err),
    });
  }

  /** Get matching trend for a currency (EUR → USD trend, USD → GBP etc.) */
  getTrendFor(currency: string): ForexTrendItem | undefined {
    return this.dailyTrends().find(t => t.currency === currency);
  }

  /** Display formatted date */
  getFormattedDate(rate: ForexRate | null): string {
    if (!rate) return '';
    if (rate.createdAt) {
      return new Date(rate.createdAt).toLocaleString();
    }
    if (rate.timestamp) {
      return new Date(rate.timestamp * 1000).toLocaleString();
    }
    return '';
  }

  onBaseChange(base: string) {
    this.selectedBase.set(base);
    this.loadRates();
  }

  /** Transform rates into list for easy display */
  ratesArray = computed(() => {

  const rate = this.latest();

  if (!rate) return [];

  return Object.entries(rate.rates).map(([currency, value]) => ({

    currency,

    name: this.currencies[currency]?.name ?? currency,

    icon: this.currencies[currency]?.icon,

    value,

    trendInfo: this.getTrendFor(currency)

  }));

});

  get currentLanguage(): 'EN' | 'DE' {
  return this.languageService.getLanguage();
}

}
