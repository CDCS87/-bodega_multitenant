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
    path: 'pyme/orders',
    loadComponent: () =>
      import('./pages/pyme/orders/orders.page').then(m => m.OrdersPage),
  },
  /*
  {
    path: 'pyme/orders/despachos',
    loadComponent: () =>
      import('./pages/pyme/orders/despachos/despachos.page').then(m => m.DespachosPage),
  },
  {
    path: 'pyme/orders/despachos/crear',
    loadComponent: () =>
      import('./pages/pyme/orders/despachos/crear/crear-despacho.page').then(m => m.CrearDespachoPage),
  },
  {
    path: 'pyme/orders/despachos/:id',
    loadComponent: () =>
      import('./pages/pyme/orders/despachos/detalle/despacho-detalle.page').then(m => m.DetalleDespachoPage),
  },
  */
  {
    path: 'pyme/orders/retiros/crear',
    loadComponent: () =>
      import('./pages/pyme/orders/retiros/crear/crear-retiro.page').then(m => m.CrearRetiroPage),
  },
  {
    path: 'pyme/orders/retiros/:id',
    loadComponent: () =>
      import('./pages/pyme/orders/retiros/detalle/retiro-detalle.page').then(m => m.RetiroDetallePage),
  },
  {
    path: 'pyme/orders/retiros/:id',
    loadComponent: () => import('./pages/pyme/orders/retiros/detalle-retiro-historial/detalle-retiro-historial.page').then( m => m.DetalleRetiroHistorialPage)
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
  {
    path: '',
    redirectTo: 'admin/usuarios',
    pathMatch: 'full',
  },
   {
     path: 'admin/usuarios',
     loadComponent: () => import('./pages/admin/usuarios/usuarios.page').then( m => m.UsuariosPage)
   },
   {
     path: 'admin/crear-usuario',
     loadComponent: () => import('./pages/admin/crear-usuario/crear-usuario.page').then( m => m.CrearUsuarioPage)
   },

  // FALLBACK
  { path: '**', redirectTo: '' }
];




