import { Routes } from '@angular/router';
import { authGuard, responsabileGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-responsabile/dashboard-responsabile.component').then(m => m.DashboardResponsabileComponent),
    canActivate: [responsabileGuard]
  },
  {
    path: 'turni',
    loadComponent: () => import('./pages/dashboard-addetto/dashboard-addetto.component').then(m => m.DashboardAddettoComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];