export interface CryptoDashboardInterface {
  symbol: string;
  name: string;
  icon: string;

  value: number;

  open: number;
  high: number;
  low: number;

  trend: string;
  change: number;
  changePercent: number;

  volume: number;
  quoteVolume: number;
  trades: number;

  bid: number;
  ask: number;
  spread: number;
}
