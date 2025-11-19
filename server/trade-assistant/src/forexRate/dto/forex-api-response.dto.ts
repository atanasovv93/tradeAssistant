/* eslint-disable prettier/prettier */
export interface ForexApiResponse {
  success: boolean;               
  base: string;                   
  timestamp: number;             
  rates: Record<string, number>;  
  date?: string;                  
}
