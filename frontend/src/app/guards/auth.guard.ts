// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si está logueado
  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // 2. Verificar Rol (si la ruta especifica uno)
  const expectedRole = route.data['role']; // Sacamos el rol esperado de la ruta
  if (expectedRole) {
    const userRole = String(auth.getUserRole() || '').toUpperCase().trim();
    
    if (userRole !== expectedRole.toUpperCase()) {
      console.warn(`Acceso denegado: Se esperaba ${expectedRole} y se tiene ${userRole}`);
      router.navigate(['/home']); // Redirige al home para que el dispatcher haga su magia
      return false;
    }
  }

  return true;
};




