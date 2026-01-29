import { Routes } from '@angular/router';
import { RecurringExpensesPageComponent } from './components/recurring-expenses-page/recurring-expenses-page.component';
import { authGuard } from '../../core/guards/auth.guard';

export const RECURRING_EXPENSES_ROUTES: Routes = [
  {
    path: '',
    component: RecurringExpensesPageComponent,
    canActivate: [authGuard]
  }
];
