/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';

export interface CryptoTrend {
  symbol: string;
  open: number;
  mid?: number | null;
  close: number;
  change: number;
  trend: string;
}

export interface CryptoTrendsResponse {
  trends: CryptoTrend[];
}

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private readonly http = inject(HttpClient);

  constructor() {}

  /**
   * Влече 24h податоци за еден крипто символ од Binance
   */
  get24hTrend(symbol: string): Observable<CryptoTrend> {
    const apiUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`;
    return this.http.get<any>(apiUrl).pipe(
      map(res => {
        const open = parseFloat(res.openPrice);
        const close = parseFloat(res.lastPrice);
        const change = close - open;
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        const mid = (open + close) / 2;

        return { symbol: res.symbol, open, mid, close, change, trend } as CryptoTrend;
      })
    );
  }

  /**
   * Влече повеќе символи и враќа како CryptoTrendsResponse
   */
  getMultiple24hTrends(symbols: string[]): Observable<CryptoTrendsResponse> {
    const requests = symbols.map(s => this.get24hTrend(s));
    return forkJoin(requests).pipe(
      map(trends => ({ trends }))
    );
  }

  /**
   * Секогаш може да додадеш старите API повици за backend ако сакаш
   */
  syncAll(): Observable<any> {
    return this.http.get<any>(`/api/crypto/sync`);
  }

  getSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`/api/crypto/symbols`);
  }

  getHistory(symbol: string): Observable<any> {
    return this.http.get<any>(`/api/crypto/history/${symbol.toUpperCase()}`);
  }
}
