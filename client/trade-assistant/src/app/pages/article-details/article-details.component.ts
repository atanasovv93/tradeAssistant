import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { NewsService, News } from '../../services/news/news.service';
import { BackButtonComponent } from '../../shared/back-button/back-button.component';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-article-details',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  templateUrl: './article-details.component.html',
  styleUrls: ['./article-details.component.scss']
})
export class ArticleDetailsComponent implements OnInit, OnDestroy {

  news: News | null = null;
  message = '';

  private languageSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private routesService: NewsService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadArticle();

    this.languageSub = this.languageService.language$.subscribe(() => {
      this.loadArticle();
    });
  }

  loadArticle() {
  const id = this.route.snapshot.paramMap.get('id');

  if (!id) return;

  this.routesService
    .getOne(+id, this.languageService.getLanguage())
    .subscribe({
      next: (res) => {
        this.news = res;
      },
      error: () => {
        this.message = '❌ Error fetching article details.';
      },
    });
}

  ngOnDestroy(): void {
    this.languageSub?.unsubscribe();
  }

  get currentLanguage(): 'EN' | 'DE' {
    return this.languageService.getLanguage();
  }
}
