import { Component } from '@angular/core';
import { LanguageService } from '../../services/language/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  currentYear = new Date().getFullYear();

  constructor(private languageService: LanguageService) {}

  get currentLanguage(): 'EN' | 'DE' {
    return this.languageService.getLanguage();
  }
}
