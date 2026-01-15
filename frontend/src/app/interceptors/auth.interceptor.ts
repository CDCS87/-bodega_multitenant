// frontend/src/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

// ✅ Control de renovación concurrente
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

/**
 * 🔐 INTERCEPTOR HTTP CON RENOVACIÓN AUTOMÁTICA DE TOKENS
 * RF1: Manejo de tokens JWT con renovación automática
 */
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1) Obtener access token
  const token = auth.getAccessToken();

  // 2) Agregar Authorization header si hay token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 3) Enviar request y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // ❌ Si es 401 y NO es el endpoint de refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        
        // Si ya está refrescando, esperar
        if (isRefreshing) {
          return refreshSubject.pipe(
            switchMap((newToken) => {
              if (newToken) {
                // Reintentar request con nuevo token
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(retryReq);
              }
              // Si no hay token, logout
              auth.logout();
              return throwError(() => error);
            })
          );
        }

        // Iniciar proceso de renovación
        isRefreshing = true;
        refreshSubject.next(null);

        return auth.refreshAccessToken().pipe(
          switchMap((response) => {
            isRefreshing = false;
            
            const newToken = response.accessToken;
            refreshSubject.next(newToken);

            // Reintentar request original con nuevo token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });

            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            
            console.error('❌ Error al renovar token:', refreshError);
            
            // Si falla la renovación, cerrar sesión
            auth.logout();
            router.navigate(['/login'], { replaceUrl: true });
            
            return throwError(() => refreshError);
          })
        );
      }

      // ❌ Si es 403 (Forbidden)
      if (error.status === 403) {
        console.error('❌ Acceso denegado:', error.error.message);
        // Podríamos redirigir a una página de "acceso denegado"
      }

      // Para otros errores, simplemente propagarlos
      return throwError(() => error);
    })
  );
};

