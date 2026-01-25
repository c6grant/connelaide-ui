import { Routes } from '@angular/router';
import { PayPeriodsPageComponent } from './components/pay-periods-page/pay-periods-page.component';
import { authGuard } from '../../core/guards/auth.guard';

export const PAY_PERIODS_ROUTES: Routes = [
  {
    path: '',
    component: PayPeriodsPageComponent,
    canActivate: [authGuard]
  }
];
