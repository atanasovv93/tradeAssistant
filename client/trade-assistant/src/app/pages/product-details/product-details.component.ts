import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService, Product } from '../../services/product.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadProduct(id);
  }

  loadProduct(id: number) {
    this.productsService.getOne(id).subscribe({
      next: (res) => this.product = res,
      error: () => this.message = '❌ Грешка при вчитување на продуктот'
    });
  }
}
