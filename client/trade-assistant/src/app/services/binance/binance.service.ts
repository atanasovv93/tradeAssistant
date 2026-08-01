/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CryptoTrend {
  symbol: string;
  open: number;
  mid?: number | null;
  close: number;
  change: number;
  priceChangePercent: number;
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
   * Live 24h ticker преку Binance WebSocket
   */
  get24hTrend(symbol: string): Observable<CryptoTrend> {
    return new Observable<CryptoTrend>((observer) => {
      const socket = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
      );

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        const open = parseFloat(data.o);
        const close = parseFloat(data.c);
        const priceChangePercent = parseFloat(data.P);
        const change = close - open;
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        const mid = (open + close) / 2;

        observer.next({
          symbol: data.s,
          open,
          mid,
          close,
          change,
          priceChangePercent,
          trend,
        });
      };

      socket.onerror = (err) => observer.error(err);

      return () => {
        socket.close();
      };
    });
  }

  /**
   * Live повеќе симболи преку една WebSocket конекција
   */
  getMultiple24hTrends(symbols: string[]): Observable<CryptoTrendsResponse> {
    return new Observable<CryptoTrendsResponse>((observer) => {
      const streams = symbols
        .map((s) => `${s.toLowerCase()}@ticker`)
        .join('/');

      const socket = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${streams}`
      );

      const trendsMap: Record<string, CryptoTrend> = {};

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const data = message.data;

        const open = parseFloat(data.o);
        const close = parseFloat(data.c);
        const priceChangePercent = parseFloat(data.P);
        const change = close - open;
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        const mid = (open + close) / 2;

        trendsMap[data.s] = {
          symbol: data.s,
          open,
          mid,
          close,
          change,
          priceChangePercent,
          trend,
        };

        observer.next({
          trends: Object.values(trendsMap),
        });
      };

      socket.onerror = (err) => observer.error(err);

      return () => {
        socket.close();
      };
    });
  }

  /**
   * Backend API
   */
  syncAll(): Observable<any> {
    return this.http.get<any>(`/api/crypto/sync`);
  }

  getSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`/api/crypto/symbols`);
  }

  getHistory(symbol: string): Observable<any> {
    return this.http.get<any>(
      `/api/crypto/history/${symbol.toUpperCase()}`
    );
  }
}
