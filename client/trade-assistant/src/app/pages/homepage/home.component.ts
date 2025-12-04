import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NewsService } from '../../services/news/news.service';
import { ProductsService, Product } from '../../services/product/product.service';
import { NewsScrollerComponent } from '../../shared/news-scroller/news-scroller.component';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { CryptoDashboardWidgetComponent } from './components/crypto-dashboard-widget/crypto-dashboard-widget.component';
import { ForexDashboardWidgetComponent } from './components/forex-dashboard-widget/forex-dashboard-widget.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    LoadingSpinnerComponent,
    NewsScrollerComponent,
    CryptoDashboardWidgetComponent,
    ForexDashboardWidgetComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  articleList: any[] = [];
  articleByCategory: { [key: string]: any[] } = {};

  productsList: Product[] = [];
  message = '';

  isLoadingNews = true;
  isLoadingProducts = true;

  constructor(
    private newsService: NewsService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.loadNews();
    this.loadProducts();
  }

  loadNews() {
    this.newsService.getAll().subscribe({
      next: (res: any) => {
        this.articleList = Array.isArray(res) ? res : res.items ? res.items : [];
      },
      error: () => (this.message = '❌ Грешка при вчитување на вести'),
      complete: () => (this.isLoadingNews = false)
    });
  }

  loadProducts() {
    this.productsService.getAll().subscribe({
      next: (res: any) => {
        this.productsList = Array.isArray(res)
          ? res
          : res.items
            ? res.items
            : [];
      },
      error: () => (this.message = '❌ Грешка при вчитување на продукти'),
      complete: () => (this.isLoadingProducts = false)
    });
  }

  get isLoading(): boolean {
    return this.isLoadingNews || this.isLoadingProducts;
  }
}
