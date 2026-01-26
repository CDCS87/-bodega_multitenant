// frontend/src/services/auth.service.ts
import { Injectable, NgZone } from '@angular/core'; // Añadido NgZone para optimizar timers
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

  // Observable para estado de autenticación
  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authState$ = this.authState.asObservable();

  // Timer para renovar token automáticamente
  private refreshTimer: any;

  // Timer para control de inactividad humana
  private inactivityTimer: any;
  private readonly INACTIVITY_TIME = 10 * 60 * 1000; // 10 Minutos exactos

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ngZone: NgZone // Inyectado para manejar eventos fuera de la zona de Angular
  ) {
    // Iniciar renovación automática si hay sesión activa
    if (this.isLoggedIn()) {
      this.scheduleTokenRefresh();
      this.startInactivityMonitoring(); // Inicia monitoreo al refrescar la app
    }
  }

  /**
   * LOGIN
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { 
      email, 
      password 
    }).pipe(
      tap((res) => {
        if (res.success) {
          localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          
          this.authState.next(true);

          //  Programar renovación automática del token
          this.scheduleTokenRefresh();
          
          //  NUEVO: Iniciar monitoreo de inactividad tras login exitoso
          this.startInactivityMonitoring();

          console.log(' Login exitoso');
        }
      }),
      catchError((error) => {
        console.error(' Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   *  NUEVO: INICIAR MONITOREO DE INACTIVIDAD SELECTIVO
   * Aplica para ADMIN, PYME y BODEGA. TRANSPORTISTA queda fuera.
   */
  private startInactivityMonitoring(): void {
    const role = this.getUserRole();

    // 🚚 REGLA: Si es transportista, NUNCA se cierra la aplicación por inactividad
    if (role === 'TRANSPORTISTA') {
      console.log('🚚 Modo Transporte: Inactividad desactivada para seguridad en ruta.');
      this.stopInactivityTimer();
      return;
    }

    console.log(`⏱️ Vigilancia activa para ${role}. Tiempo límite: 10 minutos.`);
    
    // Usamos NgZone para que los movimientos del mouse no ralenticen la app
    this.ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'click', 'keypress', 'touchstart', 'scroll'];
      events.forEach(event => {
        window.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
      });
      this.resetInactivityTimer();
    });
  }

  /**
   *  NUEVO: RESETEAR EL RELOJ DE INACTIVIDAD
   */
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.ngZone.run(() => {
        console.log('🚪 Sesión finalizada por inactividad prolongada (10 min).');
        this.logout();
      });
    }, this.INACTIVITY_TIME);
  }

  /**
   *  NUEVO: DETENER EL RELOJ
   */
  private stopInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  /**
   * RENOVAR ACCESS TOKEN
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
          localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
          
          console.log('🔄 Token renovado exitosamente');
          this.scheduleTokenRefresh();
        }
      }),
      catchError((error) => {
        console.error('❌ Error al renovar token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * PROGRAMAR RENOVACIÓN AUTOMÁTICA
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshTime = 14 * 60 * 1000; // 14 minutos

    this.refreshTimer = setTimeout(() => {
      console.log('Renovando token automáticamente...');
      this.refreshAccessToken().subscribe({
        next: () => console.log('✅ Renovación automática exitosa'),
        error: (err) => console.error('❌ Error en renovación automática:', err)
      });
    }, refreshTime);
  }

  /**
   * LOGOUT
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken })
        .subscribe({
          next: () => console.log('✅ Logout en backend exitoso'),
          error: (err) => console.error('❌ Error en logout backend:', err)
        });
    }

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    //  NUEVO: Limpiar timer de inactividad al cerrar sesión
    this.stopInactivityTimer();

    this.authState.next(false);
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

  getMyPyme(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/pyme/me`);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; 
      const now = Date.now();
      const timeLeft = expiresAt - now;
      return timeLeft < 2 * 60 * 1000;
    } catch {
      return true;
    }
  }
}
