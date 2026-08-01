import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Metal {
trendInfo: any;
  symbol: string;
  name: string;
  value: number;
  timestamp: string;
}


@Injectable({
  providedIn: 'root',
})
export class MetalsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://tradeassistant.onrender.com/metals/latest';


  getLatest(): Observable<Metal[]> {

    return this.http.get<Metal[]>(this.apiUrl);

  }

}
