/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ForexService, ForexRate } from '../../services/forex.service/forex.service.js';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component.js';

@Component({
  selector: 'app-forex-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './forex-dashboard-widget.component.html',
  styleUrls: ['./forex-dashboard-widget.component.scss'],
})
export class ForexDashboardWidgetComponent implements OnInit {
  private readonly forexService = inject(ForexService);

  // Сите валути што ќе ги поддржиме како base
  readonly bases = ['EUR', 'USD', 'GBP', 'CHF', 'AUD', 'CAD', 'MKD'];

  // state (Angular signals)
  selectedBase = signal<string>('EUR');
  latest = signal<ForexRate | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // map на rates за лесно прикажување во template
  ratesArray = computed(() => {
    const rate = this.latest();
    if (!rate) return [];
    return Object.entries(rate.rates).map(([currency, value]) => ({
      currency,
      value,
    }));
  });

  ngOnInit(): void {
    this.loadRates();
  }

  onBaseChange(base: string) {
    this.selectedBase.set(base);
    this.loadRates();
  }

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
        this.error.set('Не можам да ги вчитам курсевите моментално.');
        this.loading.set(false);
      },
    });
  }

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
}
