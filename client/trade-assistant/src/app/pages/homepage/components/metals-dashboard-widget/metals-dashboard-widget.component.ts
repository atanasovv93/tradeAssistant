import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MetalsService } from '../../../../services/metals/metals.service';
import { LoadingSpinnerComponent } from '../../../../shared/loading-spinner/loading-spinner.component';
import { MetalInterface } from './interfaces/metals.interface';

@Component({
  selector: 'app-metals-widget',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './metals-dashboard-widget.component.html',
  styleUrls: ['./metals-dashboard-widget.component.scss'],
})
export class MetalsWidgetComponent implements OnInit {
  private readonly metalsService = inject(MetalsService);

  metals = signal<MetalInterface[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  readonly icons: Record<string, string> = {
    GOLD: 'https://toppng.com/uploads/preview/gold-icon-png-11552734864v7qggzoe3y.png',
    SILVER:
      'https://p7.hiclipart.com/preview/96/716/10/silver-metal-icon-silver-png.jpg',
    PLATINUM:
      'https://img.magnific.com/premium-psd/raw-platinum-nugget-isolated-transparent-background_220739-42285.jpg',
    PALLADIUM:
      'https://png.pngtree.com/png-vector/20250213/ourlarge/pngtree-palladium-on-white-background-4-png-image_15456294.png',
  };

  ngOnInit(): void {
    this.loadMetals();
  }

  private loadMetals(): void {
    this.loading.set(true);
    this.error.set(null);

    this.metalsService.getLatest().subscribe({
      next: (data) => {
  this.metals.set(data);
  this.loading.set(false);
},

      error: () => {
        this.error.set('Cannot load metals prices.');

        this.loading.set(false);
      },
    });
  }

  getIcon(symbol: string): string {
    return this.icons[symbol] ?? '💰';
  }

  formatValue(value: number): string {
    return value.toFixed(4);
  }

  formatDate(date: string): string {
  if (!date) {
    return 'Invalid date';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    console.error('Unknown date format:', date);
    return 'Invalid date';
  }

  return parsedDate.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
}
