/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface CryptoRate {
  base: string;
  rates: Record<string, number>;
  timestamp?: number;
  createdAt?: string;
}

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

export interface CryptoAnalysis {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  rsi: number;
  price: number;
  indicators: {
    ema20: number;
    ema50: number;
  };
  signals: {
    trendSignal: 'buy' | 'sell' | 'neutral';
    rsiSignal: 'overbought' | 'oversold' | 'neutral';
  };
}

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private readonly http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/crypto`;


  syncAll(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sync`);
  }


  getSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/symbols`);
  }


  getHistory(symbol: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/history/${symbol.toUpperCase()}`);
  }


  getDailyTrends(): Observable<CryptoTrendsResponse> {
    return this.http.get<CryptoTrendsResponse>(`${this.baseUrl}/daily-trends`);
  }


  getWeeklyTrends(): Observable<CryptoTrendsResponse> {
    return this.http.get<CryptoTrendsResponse>(`${this.baseUrl}/weekly-trends`);
  }


  getMonthlyTrends(): Observable<CryptoTrendsResponse> {
    return this.http.get<CryptoTrendsResponse>(`${this.baseUrl}/monthly-trends`);
  }


  analyzeSymbol(symbol: string): Observable<CryptoAnalysis> {
    return this.http.get<CryptoAnalysis>(
      `${this.baseUrl}/analysis/${symbol.toUpperCase()}`
    );
  }
}
