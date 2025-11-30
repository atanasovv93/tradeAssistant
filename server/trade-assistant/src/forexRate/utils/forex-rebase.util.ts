/* eslint-disable prettier/prettier */
import { ForexApiResponse } from '../dto/forex-api-response.dto';

export type Rates = Record<string, number>;

export interface RebasedResponse {
  base: string;
  rates: Rates;
  timestamp: number;
}

export type RebasedMap = Record<string, RebasedResponse>;

export function buildAllBaseRates(data: ForexApiResponse): RebasedMap {
  const { base, rates, timestamp } = data;

  const allCurrencies = [base, ...Object.keys(rates)];

  const getRateFromBaseTo = (currency: string): number => {
    if (currency === base) return 1;
    return rates[currency];
  };

  const result: RebasedMap = {};

  for (const newBase of allCurrencies) {
    const baseToNewBase = getRateFromBaseTo(newBase);

    const newRates: Rates = {};

    for (const currency of allCurrencies) {
      if (currency === newBase) continue;

      const baseToCurrency = getRateFromBaseTo(currency);
      const rateNewBaseToCurrency = baseToCurrency / baseToNewBase;

      newRates[currency] = +rateNewBaseToCurrency.toFixed(6);
    }

    result[newBase] = {
      base: newBase,
      rates: newRates,
      timestamp,
    };
  }

  return result;
}
