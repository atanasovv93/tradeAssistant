/* eslint-disable prettier/prettier */
export interface ForexApiResponse {
  success: boolean;               // дали fetch е успешен
  base: string;                   // базна валута, нпр. "USD"
  timestamp: number;              // UNIX timestamp кога се земени податоците
  rates: Record<string, number>;  // курсеви, динамичен објект
  date?: string;                  // опционално, ако API-то враќа date
}
