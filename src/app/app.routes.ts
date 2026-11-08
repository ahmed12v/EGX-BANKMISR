import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { crmGuard } from './core/guards/crm-guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.Dashboard),
    canActivate: [crmGuard],
  },
      { path: "", redirectTo: "login", pathMatch: "full" },
   //Auth
  {
    path: "login",
    loadComponent: () => import('./pages/auth/login/login').then((c) => c.Login),
  },
  //pages
  {
    path: "home",
    loadComponent: () => import('./pages/home/home/home').then((c) => c.Home),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home/home/home-content').then(c => c.HomeContent) },
      { path: 'advanced-search', loadComponent: () => import('./pages/pages/advanced-search/advanced-search').then((c) => c.AdvancedSearch) },
      { path: 'query-complain', loadComponent: () => import('./pages/pages/queary-complain/queary-complain').then((c) => c.QuearyComplain) },
      { path: 'updated-request', loadComponent: () => import('./pages/pages/updated-req/updated-req').then((c) => c.UpdatedReq) },
    ],
    canActivate: [authGuard],
  },
//   {
//     path: "**",
//     loadComponent: () => import("./pages/notfound/notfound").then((c) => c.Notfound),
//   },
];
