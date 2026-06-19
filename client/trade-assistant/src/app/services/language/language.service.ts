import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private languageSubject = new BehaviorSubject<'EN' | 'DE'>(
    (localStorage.getItem('language') as 'EN' | 'DE') || 'EN'
  );

  language$ = this.languageSubject.asObservable();

  getLanguage(): 'EN' | 'DE' {
    return this.languageSubject.value;
  }

  setLanguage(language: 'EN' | 'DE') {
    localStorage.setItem('language', language);
    this.languageSubject.next(language);
  }
}
