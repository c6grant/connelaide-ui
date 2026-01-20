import { Routes } from '@angular/router';
import { TransactionsPageComponent } from './components/transactions-page/transactions-page.component';
import { authGuard } from '../../core/guards/auth.guard';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    component: TransactionsPageComponent,
    canActivate: [authGuard]
  }
];
