import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {

  constructor(
    private location: Location,
    private languageService: LanguageService
  ) {}

  goBack() {
    this.location.back();
  }

  get currentLanguage(): 'EN' | 'DE' {
    return this.languageService.getLanguage();
  }
}
