import { Routes } from '@angular/router';

export const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page')
        .then(m => m.LoginPage),
  },

  // HOME (redirige según rol, si lo tienes así)
  {
    path: '',
    loadComponent: () =>
      import('./home/home.page')
        .then(m => m.HomePage),
  },

  // ======================
  // PYME
  // ======================
  {
    path: 'pyme/dashboard',
    loadComponent: () =>
      import('./pages/pyme/dashboard/dashboard.page')
        .then(m => m.DashboardPage),
  },
  {
    path: 'pyme/pedidos',
    loadComponent: () =>
      import('./pages/pyme/pedidos/pedidos.page')
        .then(m => m.PedidosPage),
  },

  // ======================
  // BODEGA
  // ======================
  {
    path: 'bodega/recepcion',
    loadComponent: () =>
      import('./pages/bodega/recepcion/recepcion.page')
        .then(m => m.RecepcionPage),
  },
  {
    path: 'bodega/picking',
    loadComponent: () =>
      import('./pages/bodega/picking/picking.page')
        .then(m => m.PickingPage),
  },


  // ======================
  // TRANSPORTE
  // ======================
  {
    path: 'transporte/dashboard',
    loadComponent: () =>
      import('./pages/transporte/dashboard/transporte-dashboard.page')
        .then(m => m.TransporteDashboardPage),
  },
  {
    path: 'transporte/retiros',
    loadComponent: () =>
      import('./pages/transporte/retiros/transporte-retiros.page')
        .then(m => m.TransporteRetirosPage),
  },
 /* {
    path: 'transporte/despachos',
    loadComponent: () =>
      import('./pages/transporte/despachos/despachos.page')
        .then(m => m.DespachosPage),
  }, */

  // ======================
  // ADMIN
  // ======================
/*  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard')
        .then(m => m.DashboardPage),
  },
*/ 
  // FALLBACK
  { path: '**', redirectTo: '' }
];




