import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductsService, Product } from '../../services/product.service';
import { Router } from '@angular/router';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component'; // ✅ Import

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ConfirmModalComponent] // ✅ Додадено тука
})
export class ProductsComponent implements OnInit {
  productsList: Product[] = [];
  message = '';

  newProduct: Product = { name: '', image: '', category: '', quantity: 0 };

  editingProductId: number | null = null;
  editedProduct: Product = { name: '', image: '', category: '', quantity: 0 };

  showDeleteModal = false;
  productIdToDelete: number | null = null;

  constructor(private productsService: ProductsService, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.getAll().subscribe({
      next: (res: any) => {
        this.productsList = Array.isArray(res.items) ? res.items : res;
      },
      error: () => (this.message = '❌ Грешка при вчитување на продукти')
    });
  }

  addProduct() {
    const formattedProduct = {
      ...this.newProduct,
      quantity: Number(this.newProduct.quantity),
      purchasePrice: Number(this.newProduct.purchasePrice),
      salePrice: Number(this.newProduct.salePrice)
    };

    this.productsService.create(formattedProduct).subscribe({
      next: () => {
        this.message = '✅ Продуктот е успешно додаден!';
        this.loadProducts();
        this.newProduct = { name: '', image: '', category: '', quantity: 0 };
      },
      error: () => (this.message = '❌ Грешка при додавање на продукт')
    });
  }

  openDeleteModal(id: number) {
    this.showDeleteModal = true;
    this.productIdToDelete = id;
  }

  confirmDelete() {
  if (this.productIdToDelete !== null) {
    this.productsService.delete(this.productIdToDelete).subscribe({
      next: () => {
        this.message = '✅ Продуктот е успешно избришан!';
        this.loadProducts();
        setTimeout(() => (this.message = ''), 3000);
      },
      error: () => {
        this.message = '❌ Грешка при бришење на продукт';
        setTimeout(() => (this.message = ''), 3000);
      },
      complete: () => {
        this.showDeleteModal = false;
        this.productIdToDelete = null;
      }
    });
  } else {
    this.showDeleteModal = false;
    this.productIdToDelete = null;
  }
}

  cancelDelete() {
    this.showDeleteModal = false;
    this.productIdToDelete = null;
  }

  deleteProduct(id: number) {
    this.productsService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: () => (this.message = '❌ Грешка при бришење на продукт')
    });
  }

  startEdit(product: Product) {
    this.editingProductId = product.id!;
    this.editedProduct = { ...product };
  }

  cancelEdit() {
    this.editingProductId = null;
    this.editedProduct = { name: '', image: '', category: '', quantity: 0 };
  }

  saveEdit() {
    if (!this.editingProductId) return;

    const formattedEdited = {
      ...this.editedProduct,
      quantity: Number(this.editedProduct.quantity),
      purchasePrice: Number(this.editedProduct.purchasePrice),
      salePrice: Number(this.editedProduct.salePrice)
    };

    this.productsService.update(this.editingProductId, formattedEdited).subscribe({
      next: () => {
        this.message = '✅ Продуктот е успешно изменет!';
        this.loadProducts();
        this.cancelEdit();
      },
      error: () => (this.message = '❌ Грешка при изменување на продукт')
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
