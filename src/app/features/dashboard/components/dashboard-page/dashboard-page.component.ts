import { Component, OnInit } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { StatsCardComponent } from '../stats-card/stats-card.component';
import { AggregateChartComponent } from '../aggregate-chart/aggregate-chart.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [NgIf, AsyncPipe, StatsCardComponent, AggregateChartComponent, LoadingSpinnerComponent],
  template: `
    <div class="dashboard">
      <div class="welcome-section">
        <h1>Dashboard</h1>
        <p *ngIf="auth.user$ | async as user">Welcome back, {{ user.name || user.email }}!</p>
        <p *ngIf="!(auth.isAuthenticated$ | async)">Log in to see your financial overview.</p>
      </div>

      <ng-container *ngIf="auth.isAuthenticated$ | async">
        <div class="stats-grid" *ngIf="stats; else loadingStats">
          <app-stats-card
            label="Total Balance"
            [value]="stats.totalBalance"
            icon="pi pi-wallet"
            colorClass="blue">
          </app-stats-card>
          <app-stats-card
            label="Income"
            [value]="stats.totalIncome"
            icon="pi pi-arrow-up"
            colorClass="green">
          </app-stats-card>
          <app-stats-card
            label="Expenses"
            [value]="stats.totalExpenses"
            icon="pi pi-arrow-down"
            colorClass="red">
          </app-stats-card>
          <app-stats-card
            label="Transactions"
            [value]="stats.transactionCount"
            icon="pi pi-list"
            [isCurrency]="false">
          </app-stats-card>
        </div>
        <ng-template #loadingStats>
          <app-loading-spinner></app-loading-spinner>
        </ng-template>

        <div class="charts-grid">
          <app-aggregate-chart
            title="Monthly Spending Trend"
            type="line"
            [data]="monthlyTrendData"
            *ngIf="monthlyTrendData">
          </app-aggregate-chart>
          <app-aggregate-chart
            title="Spending by Category"
            type="doughnut"
            [data]="categoryData"
            *ngIf="categoryData">
          </app-aggregate-chart>
        </div>
      </ng-container>

      <div class="unauthenticated-message" *ngIf="!(auth.isAuthenticated$ | async)">
        <p>Please log in to view your dashboard.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .welcome-section h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
    }
    .welcome-section p {
      margin: 0;
      color: #6b7280;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }
    .unauthenticated-message {
      text-align: center;
      padding: 40px;
      background-color: #f9fafb;
      border-radius: 8px;
      color: #6b7280;
    }
    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  stats: DashboardStats | null = null;
  monthlyTrendData: any = null;
  categoryData: any = null;

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: () => {
        // Use placeholder data if API not available
        this.stats = {
          totalBalance: 12500.00,
          totalIncome: 5200.00,
          totalExpenses: 3100.00,
          transactionCount: 47
        };
      }
    });

    this.dashboardService.getMonthlyTrend().subscribe({
      next: (data) => this.monthlyTrendData = data,
      error: () => {
        // Use placeholder data
        this.monthlyTrendData = {
          labels: ['Oct', 'Nov', 'Dec', 'Jan'],
          datasets: [{
            label: 'Spending',
            data: [2800, 3200, 2900, 3100],
            borderColor: '#3b82f6',
            tension: 0.4
          }]
        };
      }
    });

    this.dashboardService.getSpendingByCategory().subscribe({
      next: (data) => this.categoryData = data,
      error: () => {
        // Use placeholder data
        this.categoryData = {
          labels: ['Food', 'Transport', 'Shopping', 'Bills', 'Other'],
          datasets: [{
            data: [800, 400, 600, 900, 400],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          }]
        };
      }
    });
  }
}
