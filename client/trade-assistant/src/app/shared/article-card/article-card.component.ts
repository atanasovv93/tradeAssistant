import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent {
  private readonly languageService = inject(LanguageService);
  @Input() article: any;

  get currentLanguage(): 'EN' | 'DE' {
  return this.languageService.getLanguage();
}
}
