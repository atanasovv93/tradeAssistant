import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent {

  constructor(private languageService: LanguageService) {}

  get currentLanguage() {
    return this.languageService.getLanguage();
  }

  changeLanguage(language: 'EN' | 'DE') {
    this.languageService.setLanguage(language);

    // едноставно refresh
    window.location.reload();
  }
}
