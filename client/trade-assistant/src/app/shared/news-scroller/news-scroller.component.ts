import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { News, NewsService } from '../../services/news/news.service';

@Component({
  selector: 'app-news-scroller',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-scroller.component.html',
  styleUrls: ['./news-scroller.component.scss']
})
export class NewsScrollerComponent implements OnInit, OnDestroy {
  isPaused = false;
  @Input() excludeId?: number | string;

  private newsService = inject(NewsService);
  private refreshSub!: Subscription;

  articles: News[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadNews();

    // Refresh every 5 minutes
    this.refreshSub = interval(5 * 60 * 1000)
      .pipe(
        switchMap(() => this.newsService.getAll())
      )
      .subscribe((res: any) => {
        this.articles = this.filterExcluded(res.items);
      });
  }

  private loadNews() {
    this.newsService.getAll()
  .subscribe((res: any) => {
    this.articles = this.filterExcluded(res.items);
    this.isLoading = false;
  });

  }

  private filterExcluded(list: News[]) {
    return this.excludeId
      ? list.filter(a => a.id != this.excludeId)
      : list;
  }

  ngOnDestroy(): void {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }
  togglePause() {
  this.isPaused = !this.isPaused;
}
}
