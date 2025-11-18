export interface ForexTrend {
  currency: string;
  start: number;
  mid: number;
  end: number;
  dailyChange: number;
  trend: string;
}

export interface DailyAnalysis {
  base: string;
  from: string;
  to: string;
  trends: ForexTrend[];
}
