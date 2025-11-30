/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

const API_URL = environment.apiUrl;

export interface ForexRate {
  id: number;
  base: string;
  rates: Record<string, number>;
  timestamp: number;
  createdAt: string;
}

export interface ForexTrendItem {
  currency: string;
  start: number;
  mid: number;
  end: number;
  dailyChange: number;
  trend: string;
}

export interface ForexTrendsResponse {
  trends: ForexTrendItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ForexService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/forex`;


  getLatest(): Observable<ForexRate> {
    return this.http.get<ForexRate>(`${this.baseUrl}/latest`);
  }

  getLatestByBase(base: string): Observable<ForexRate> {
    return this.http.get<ForexRate>(`${this.baseUrl}/latest?base=${base}`);
  }

  getDailyTrends(): Observable<ForexTrendsResponse> {
    return this.http.get<ForexTrendsResponse>(`${this.baseUrl}/trends`);
  }

  getHistory(params?: {
    base?: string;
    from?: string;
    to?: string;
  }): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/history`, {
      params: params as any,
    });
  }
}
