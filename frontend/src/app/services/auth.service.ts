import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'token';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ===============================
  // LOGIN
  // ===============================
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email,
      password,
    }).pipe(
      tap(response => {
        this.setToken(response.token);
      })
    );
  }

  // ===============================
  // TOKEN
  // ===============================
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ===============================
  // ROL (desde JWT)
  // ===============================
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol; // 👈 CONFIRMADO: tu backend usa "rol"
    } catch (error) {
      console.error('❌ Error leyendo rol del token', error);
      return null;
    }
  }

  // ===============================
  // LOGOUT
  // ===============================
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}

