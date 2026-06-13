import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Product } from '../../services/product/product.service';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;

  get currentLanguage(): 'EN' | 'DE' {
    return this.languageService.getLanguage();
  }
  private languageService = inject(LanguageService);
}
