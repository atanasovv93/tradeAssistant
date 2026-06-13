import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  getLanguage(): 'EN' | 'DE' {
    return (localStorage.getItem('language') as 'EN' | 'DE') || 'EN';
  }

  setLanguage(language: 'EN' | 'DE') {
    localStorage.setItem('language', language);
  }
}
