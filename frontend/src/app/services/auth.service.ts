// frontend/src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    nombre_completo: string;
    rol: string;
    pyme_id: number | null;
  };
}

interface RefreshResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  //  Observable para estado de autenticación
  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authState$ = this.authState.asObservable();

  //  Timer para renovar token automáticamente
  private refreshTimer: any;

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    // Iniciar renovación automática si hay sesión activa
    if (this.isLoggedIn()) {
      this.scheduleTokenRefresh();
    }
  }

  /**
   *  LOGIN
   * Autenticación con access token (15 min) y refresh token (7 días)
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { 
      email, 
      password 
    }).pipe(
      tap((res) => {
        if (res.success) {
          // Guardar tokens y usuario
          localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          
          this.authState.next(true);

          // ✅ Programar renovación automática del token
          this.scheduleTokenRefresh();

          console.log('✅ Login exitoso');
        }
      }),
      catchError((error) => {
        console.error('❌ Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   *  RENOVAR ACCESS TOKEN
   * RF1: Refresh tokens con rotación automática
   */
  refreshAccessToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      console.error('❌ No hay refresh token disponible');
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<RefreshResponse>(`${this.API_URL}/refresh`, { 
      refreshToken 
    }).pipe(
      tap((res) => {
        if (res.success) {
          //  Actualizar ambos tokens (rotación)
          localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
          
          console.log('🔄 Token renovado exitosamente');

          // Reprogramar siguiente renovación
          this.scheduleTokenRefresh();
        }
      }),
      catchError((error) => {
        console.error('❌ Error al renovar token:', error);
        // Si falla la renovación, cerrar sesión
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   *  PROGRAMAR RENOVACIÓN AUTOMÁTICA
   * Renueva el token 1 minuto antes de que expire
   */
  private scheduleTokenRefresh(): void {
    // Limpiar timer anterior si existe
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Access token expira en 15 minutos
    // Renovar 1 minuto antes = 14 minutos
    const refreshTime = 14 * 60 * 1000;

    this.refreshTimer = setTimeout(() => {
      console.log('Renovando token automáticamente...');
      this.refreshAccessToken().subscribe({
        next: () => console.log('✅ Renovación automática exitosa'),
        error: (err) => console.error('❌ Error en renovación automática:', err)
      });
    }, refreshTime);
  }

  /**
   *  LOGOUT
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();

    // Notificar al backend para revocar el refresh token
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken })
        .subscribe({
          next: () => console.log('✅ Logout en backend exitoso'),
          error: (err) => console.error('❌ Error en logout backend:', err)
        });
    }

    // Limpiar localStorage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Limpiar timer de renovación
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.authState.next(false);

    // Redirigir al login
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  /**
   * GETTERS
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.rol : null;
  }

  getPymeId(): number | null {
    const user = this.getUser();
    return user ? user.pyme_id : null;
  }

  /**
   *  REGISTRO
   */
  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  /**
   *  RECUPERACIÓN DE CONTRASEÑA
   */
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/request-password-reset`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, { 
      token, 
      newPassword 
    });
  }

  /**
   *  MÉTODO AUXILIAR: Verificar si el token está por expirar
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convertir a milisegundos
      const now = Date.now();
      const timeLeft = expiresAt - now;

      // Si queda menos de 2 minutos
      return timeLeft < 2 * 60 * 1000;
    } catch {
      return true;
    }
  }
}
