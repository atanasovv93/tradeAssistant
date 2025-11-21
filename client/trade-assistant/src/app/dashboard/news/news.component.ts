import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NewsService } from '../../services/news.service';
import { Router } from '@angular/router';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ConfirmModalComponent],
})
export class NewsComponent implements OnInit {
  newsList: any[] = [];
  message = '';
  newNews = {
    title: '',
    image: '',
    content: '',
    author: '',
    publishDate: '',
    category: '',
  };

  editingNewsId: number | null = null;
  editedNews: any = {};

  showDeleteModal = false;
  newsIdToDelete: number | null = null;

  constructor(private routesService: NewsService, private router: Router) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.routesService.getAll().subscribe({
      next: (res: any) => {
        this.newsList = Array.isArray(res.items) ? res.items : [];
      },
      error: () => (this.message = '❌ Error while loading news'),
    });
  }

  addNews() {
    this.routesService.create(this.newNews).subscribe({
      next: () => {
        this.message = '✅ Article successfully added!';
        this.loadNews();
        this.newNews = {
          title: '',
          image: '',
          content: '',
          author: '',
          publishDate: '',
          category: '',
        };
      },
      error: () => (this.message = '❌ Error while adding article'),
    });
  }

  openDeleteModal(id: number) {
    this.showDeleteModal = true;
    this.newsIdToDelete = id;
  }

  confirmDelete() {
  if (this.newsIdToDelete !== null) {
    this.routesService.delete(this.newsIdToDelete).subscribe({
      next: () => {
        this.message = '✅ Article successfully deleted!';
        this.loadNews();
        setTimeout(() => (this.message = ''), 3000);
      },
      error: () => {
        this.message = '❌ Error while deleting article';
        setTimeout(() => (this.message = ''), 3000);
      },
      complete: () => {
        this.showDeleteModal = false;
        this.newsIdToDelete = null;
      }
    });
  } else {
    this.showDeleteModal = false;
    this.newsIdToDelete = null;
  }
}

  cancelDelete() {
    this.showDeleteModal = false;
    this.newsIdToDelete = null;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  startEdit(news: any) {
    this.editingNewsId = news.id!;
    this.editedNews = { ...news };
  }

  cancelEdit() {
    this.editingNewsId = null;
    this.editedNews = {};
  }

  saveEdit() {
    if (!this.editingNewsId) return;

    this.routesService.update(this.editingNewsId, this.editedNews).subscribe({
      next: () => {
        this.message = '✅ Article successfully updated!';
        this.loadNews();
        this.cancelEdit();
      },
      error: () => (this.message = '❌ Error while updating article'),
    });
  }
}
