// frontend/src/services/idle.service.ts
import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * ⏱️ SERVICIO DE DETECCIÓN DE INACTIVIDAD
 * RF1: Tokens expiran en 15 minutos de inactividad
 * 
 * NOTA: Con refresh tokens, el access token expira cada 15 minutos
 * pero se renueva automáticamente. El idle service ahora sirve para
 * cerrar sesión después de INACTIVIDAD PROLONGADA (ej: 30 minutos)
 */
@Injectable({ providedIn: 'root' })
export class IdleService {
  // ⚙️ Tiempo de inactividad antes de logout forzado
  // 30 minutos = 2 renovaciones de token sin actividad
  private readonly IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  private idleTimer: any;
  private started = false;

  // Eventos que resetean el contador de inactividad
  private readonly ACTIVITY_EVENTS = [
    'mousemove', 
    'mousedown', 
    'keydown', 
    'touchstart', 
    'scroll', 
    'click'
  ];

  constructor(
    private auth: AuthService, 
    private zone: NgZone
  ) {}

  /**
   * ▶️ INICIAR MONITOREO DE INACTIVIDAD
   */
  start(): void {
    if (this.started) {
      this.resetTimer();
      return;
    }

    if (!this.auth.isLoggedIn()) {
      console.warn('⚠️ No se puede iniciar idle service: usuario no autenticado');
      return;
    }

    this.started = true;

    // Registrar listeners de actividad
    this.ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, this.onActivity, { passive: true });
    });

    this.resetTimer();

    console.log('✅ Monitoreo de inactividad iniciado (timeout: 30 min)');
  }

  /**
   * ⏹️ DETENER MONITOREO
   */
  stop(): void {
    if (!this.started) return;

    this.started = false;

    // Remover listeners
    this.ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, this.onActivity);
    });

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    console.log('⏹️ Monitoreo de inactividad detenido');
  }

  /**
   * 🔄 RESETEAR TIMER DE INACTIVIDAD
   * Se llama cada vez que hay actividad del usuario
   */
  private onActivity = (): void => {
    if (!this.auth.isLoggedIn()) {
      this.stop();
      return;
    }

    this.resetTimer();
  };

  /**
   * ⏰ RESETEAR TIMER INTERNO
   */
  private resetTimer(): void {
    if (!this.auth.isLoggedIn()) return;

    // Ejecutar fuera de Angular zone para mejor rendimiento
    this.zone.runOutsideAngular(() => {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
      }

      this.idleTimer = setTimeout(() => {
        this.zone.run(() => {
          console.log('⏱️ Timeout de inactividad alcanzado - cerrando sesión');
          this.handleIdleTimeout();
        });
      }, this.IDLE_TIMEOUT);
    });
  }

  /**
   * 🚪 MANEJAR TIMEOUT DE INACTIVIDAD
   */
  private handleIdleTimeout(): void {
    // Opcional: Mostrar advertencia antes de cerrar sesión
    const shouldLogout = confirm(
      'Su sesión ha estado inactiva por 30 minutos. ¿Desea continuar?'
    );

    if (shouldLogout) {
      this.stop();
      this.auth.logout();
    } else {
      // Usuario quiere continuar - resetear timer
      this.resetTimer();
    }
  }

  /**
   * ℹ️ OBTENER TIEMPO RESTANTE (para mostrar en UI)
   */
  getRemainingTime(): number {
    return this.IDLE_TIMEOUT;
  }
}
