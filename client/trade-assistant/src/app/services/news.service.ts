import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export interface News {
  id?: number;
  title: string;
  image?: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // GET не е заштитен, нема Authorization header
  getAll(): Observable<News[]> {
    return this.http.get<News[]>(this.baseUrl);
  }

  getOne(id: number): Observable<News> {
    return this.http.get<News>(`${this.baseUrl}/${id}`);
  }

  // CREATE, UPDATE и DELETE користат токен
  create(data: News): Observable<News> {
    return this.http.post<News>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  update(id: number, data: Partial<News>): Observable<News> {
    return this.http.put<News>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  groupByCategory(newsList: News[]): { [key: string]: News[] } {
    if (!Array.isArray(newsList)) return {};
    return newsList.reduce((acc, news) => {
      const category = news.category?.trim() || 'Нема категорија';
      if (!acc[category]) acc[category] = [];
      acc[category].push(news);
      return acc;
    }, {} as { [key: string]: News[] });
  }
}
