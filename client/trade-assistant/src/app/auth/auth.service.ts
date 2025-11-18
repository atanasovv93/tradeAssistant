import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  // 📌 Login бара email и password, backend враќа { access_token: '...' }
  login(credentials: { email: string; password: string }): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(this.apiUrl, credentials).pipe(
      tap(res => {
        if (res?.access_token) {
          this.saveToken(res.access_token);
        }
      })
    );
  }

  // 📌 Се користи унифициран клуч "token"
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Проверка дали токенот е валиден и не истечен
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }
}
