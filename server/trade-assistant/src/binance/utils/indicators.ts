/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* src/binance/utils/indicators.ts */
export class Indicators {

  static ema(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    let emaArray: number[] = [];
    let prev = data[0] ?? 0;

    data.forEach((price, i) => {
      if (i === 0) {
        emaArray.push(price);
      } else {
        const value = price * k + prev * (1 - k);
        emaArray.push(value);
        prev = value;
      }
    });

    return emaArray;
  }

  static rsi(values: number[], period = 14) {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    let rs = gains / losses;
    let rsi = [100 - 100 / (1 + rs)];

    for (let i = period + 1; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      let gain = diff > 0 ? diff : 0;
      let loss = diff < 0 ? -diff : 0;

      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;

      rs = gains / (losses || 1);
      rsi.push(100 - 100 / (1 + rs));
    }

    return rsi;
  }
}
