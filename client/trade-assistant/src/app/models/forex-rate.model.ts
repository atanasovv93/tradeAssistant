export interface ForexRate {
  id: number;
  base: string;
  rates: Record<string, number>;
  timestamp: number;
  createdAt: string;
}
