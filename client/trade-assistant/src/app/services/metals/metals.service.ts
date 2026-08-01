import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetalInterface } from '../../pages/homepage/components/metals-dashboard-widget/interfaces/metals.interface';

@Injectable({
  providedIn: 'root',
})
export class MetalsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://tradeassistant.onrender.com/metals/latest';

  getLatest(): Observable<MetalInterface[]> {
    return this.http.get<MetalInterface[]>(this.apiUrl);
  }
}
