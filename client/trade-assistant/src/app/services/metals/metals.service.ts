import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Metal {
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
    'http://localhost:8080/metals/latest';


  getLatest(): Observable<Metal[]> {

    return this.http.get<Metal[]>(this.apiUrl);

  }

}
