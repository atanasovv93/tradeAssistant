/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CryptoTrend {
  symbol: string;

  open: number;
  high: number;
  low: number;
  mid: number;
  close: number;

  change: number;
  priceChangePercent: number;
  trend: string;

  volume: number;
  quoteVolume: number;
  trades: number;

  bid: number;
  ask: number;
  spread: number;
}

export interface BinanceTrade {
  id: number;
  price: number;
  quantity: number;
  time: Date;
  side: 'BUY' | 'SELL';
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
    const url =
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;

    const socket = new WebSocket(url);
    let closedByClient = false;

    socket.onopen = () => {
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        const open = Number(data.o);
        const close = Number(data.c);
        const bid = Number(data.b);
        const ask = Number(data.a);

        if (!Number.isFinite(close) || close <= 0) {
          console.warn('[Binance] Invalid ticker price:', data);
          return;
        }

        const change = close - open;

        const trend =
          change > 0 ? '📈' : change < 0 ? '📉' : '➡️';

        const result: CryptoTrend = {
          symbol: data.s,
          open,
          high: Number(data.h),
          low: Number(data.l),
          mid: (open + close) / 2,
          close,
          change,
          priceChangePercent: Number(data.P),
          trend,
          volume: Number(data.v),
          quoteVolume: Number(data.q),
          trades: Number(data.n),
          bid,
          ask,
          spread: ask - bid,
        };

        observer.next(result);
      } catch (error) {
        console.error('[Binance] Failed to parse ticker:', error);
      }
    };

    socket.onerror = (event: Event) => {
      console.error('[Binance] WebSocket error:', symbol, event);

      if (!observer.closed) {
        observer.error(
          new Error(`Binance WebSocket failed for ${symbol}`),
        );
      }
    };

    socket.onclose = (event: CloseEvent) => {
      console.log('[Binance] WebSocket closed:', {
        symbol,
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        closedByClient,
      });

      if (!closedByClient && !observer.closed) {
        observer.error(
          new Error(`Binance WebSocket closed for ${symbol}`),
        );
      }
    };

    return () => {
      closedByClient = true;

      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      ) {
        socket.close();
      }
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
  high: parseFloat(data.h),
  low: parseFloat(data.l),
  mid,
  close,

  change,
  priceChangePercent,
  trend,

  volume: parseFloat(data.v),
  quoteVolume: parseFloat(data.q),
  trades: Number(data.n),

  bid: parseFloat(data.b),
  ask: parseFloat(data.a),
  spread: parseFloat(data.a) - parseFloat(data.b),
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

  getRecentTrades(symbol: string): Observable<BinanceTrade> {
  return new Observable<BinanceTrade>((observer) => {
    const socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const price = parseFloat(data.p);
      const quantity = parseFloat(data.q);

      const side: 'BUY' | 'SELL' = data.m ? 'SELL' : 'BUY';

      observer.next({
        id: Number(data.t),
        price,
        quantity,
        time: new Date(data.T),
        side,
      });
    };

    socket.onerror = (error) => {
      observer.error(error);
    };

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
