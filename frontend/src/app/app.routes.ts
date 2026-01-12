import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage),
  },

  {
    path: 'pyme/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/pyme/dashboard/dashboard.page').then(
        m => m.DashboardPage
      ),
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
