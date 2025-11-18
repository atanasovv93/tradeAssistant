import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export interface Product {
  id?: number;
  name: string;
  image: string;
  category: string;
  quantity: number;
  distributor?: string;
  entryDate?: string;
  expirationDate?: string;
  purchasePrice?: number;
  salePrice?: number;
  barcode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(data: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  update(id: number, data: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }


}
