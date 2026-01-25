import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES)
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
  },
  {
    path: 'pay-periods',
    loadChildren: () => import('./features/pay-periods/pay-periods.routes').then(m => m.PAY_PERIODS_ROUTES)
  }
];
