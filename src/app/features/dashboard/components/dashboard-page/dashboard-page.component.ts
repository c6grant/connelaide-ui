import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { forkJoin } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { PayPeriodsService } from '../../../pay-periods/services/pay-periods.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { ProjectedExpensesService } from '../../../transactions/services/projected-expenses.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { PayPeriod } from '../../../../shared/models/pay-period.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DecimalPipe, RouterLink, ChartModule, LoadingSpinnerComponent, CurrencyFormatPipe],
  template: `
    <div class="dashboard">
      <div class="welcome-section">
        <h1>Dashboard</h1>
        <p *ngIf="auth.user$ | async as user">Welcome back, {{ user.name || user.email }}!</p>
        <p *ngIf="!(auth.isAuthenticated$ | async)">Log in to see your financial overview.</p>
      </div>

      <ng-container *ngIf="auth.isAuthenticated$ | async">
        <app-loading-spinner *ngIf="loading"></app-loading-spinner>

        <ng-container *ngIf="!loading && currentPayPeriod">
          <!-- Total Budget Progress -->
          <div class="budget-section">
            <div class="budget-header">
              <h2>Pay Period Budget</h2>
              <span class="budget-dates">{{ currentPayPeriod.start_date }} — {{ currentPayPeriod.end_date }}</span>
            </div>
            <div class="budget-summary">
              <span class="budget-spent">{{ totalSpent | currencyFormat }}</span>
              <span class="budget-of">of</span>
              <span class="budget-total">{{ totalBudget | currencyFormat }}</span>
            </div>
            <div class="budget-bar">
              <div class="budget-bar-fill"
                   [style.width.%]="budgetPercent"
                   [class.warning]="budgetPercent >= 75 && budgetPercent < 90"
                   [class.danger]="budgetPercent >= 90"></div>
            </div>
            <span class="budget-percent">{{ budgetPercent | number:'1.0-0' }}% used</span>
          </div>

          <!-- Category Breakdown -->
          <div class="category-section" *ngIf="categoryBreakdown.length > 0">
            <h2>Spending by Category</h2>
            <div class="category-list">
              <div class="category-item" *ngFor="let cat of categoryBreakdown">
                <div class="category-header">
                  <span class="category-name">{{ cat.name }}</span>
                  <span class="category-amounts">
                    {{ cat.spent | currencyFormat }} / {{ cat.budget | currencyFormat }}
                  </span>
                </div>
                <div class="category-bar">
                  <div class="category-bar-fill"
                       [style.width.%]="categoryPercent(cat)"
                       [class.warning]="categoryPercent(cat) >= 75 && categoryPercent(cat) < 90"
                       [class.danger]="categoryPercent(cat) >= 90"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Bar Chart -->
          <div class="chart-section" *ngIf="categoryBreakdown.length > 0">
            <h2>Spending by Category — Chart</h2>
            <p-chart type="bar" [data]="chartData" [options]="chartOptions"></p-chart>
          </div>
        </ng-container>

        <div class="empty-state" *ngIf="!loading && !currentPayPeriod">
          <p>No active pay period found. <a routerLink="/pay-periods">Set up pay periods</a> to see your budget.</p>
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

    .budget-section, .category-section {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }
    .budget-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    .budget-dates {
      font-size: 14px;
      color: #6b7280;
    }
    .budget-summary {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 12px;
    }
    .budget-spent {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    .budget-of {
      font-size: 14px;
      color: #6b7280;
    }
    .budget-total {
      font-size: 18px;
      color: #6b7280;
    }
    .budget-bar, .category-bar {
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }
    .budget-bar-fill, .category-bar-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 6px;
      transition: width 0.3s ease;
    }
    .budget-bar-fill.warning, .category-bar-fill.warning {
      background: #f59e0b;
    }
    .budget-bar-fill.danger, .category-bar-fill.danger {
      background: #ef4444;
    }
    .budget-percent {
      display: inline-block;
      margin-top: 6px;
      font-size: 13px;
      color: #6b7280;
    }

    .category-section h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .category-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .category-name {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
    }
    .category-amounts {
      font-size: 13px;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      background-color: #f9fafb;
      border-radius: 8px;
      color: #6b7280;
    }
    .empty-state a {
      color: #3b82f6;
      text-decoration: none;
    }
    .empty-state a:hover {
      text-decoration: underline;
    }
    .unauthenticated-message {
      text-align: center;
      padding: 40px;
      background-color: #f9fafb;
      border-radius: 8px;
      color: #6b7280;
    }

    .chart-section {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .chart-section h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  loading = true;
  currentPayPeriod: PayPeriod | null = null;
  totalBudget = 0;
  totalSpent = 0;
  categoryBreakdown: { name: string; budget: number; spent: number }[] = [];
  chartData: any;
  chartOptions: any;

  constructor(
    public auth: AuthService,
    private payPeriodsService: PayPeriodsService,
    private transactionsService: TransactionsService,
    private projectedExpensesService: ProjectedExpensesService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.loadData();
      }
    });
  }

  get budgetPercent(): number {
    if (!this.totalBudget) return 0;
    return Math.min((this.totalSpent / this.totalBudget) * 100, 100);
  }

  categoryPercent(cat: { budget: number; spent: number }): number {
    if (!cat.budget) return 0;
    return Math.min((cat.spent / cat.budget) * 100, 100);
  }

  loadData() {
    this.loading = true;
    this.payPeriodsService.getPayPeriods().subscribe({
      next: (periods) => {
        const today = new Date().toISOString().split('T')[0];
        this.currentPayPeriod = periods.find(p => p.start_date <= today && p.end_date >= today) ?? null;

        if (!this.currentPayPeriod) {
          this.loading = false;
          return;
        }

        const start = this.currentPayPeriod.start_date;
        const end = this.currentPayPeriod.end_date;

        forkJoin({
          transactions: this.transactionsService.getTransactions(start, end),
          projectedExpenses: this.projectedExpensesService.getProjectedExpenses(start, end),
          categories: this.categoriesService.getCategories()
        }).subscribe({
          next: ({ transactions, projectedExpenses, categories }) => {
            this.totalBudget = this.currentPayPeriod!.checking_budget ?? 0;

            // Active projected expenses: not struck out and not merged
            const activeProjected = projectedExpenses.filter(
              pe => !pe.is_struck_out && pe.merged_transaction_id == null
            );

            // Only count transactions that impact the checking balance
            const checkingTransactions = transactions.filter(
              t => t.impacts_checking_balance === 'true'
            );

            // Total spent = abs(transaction amounts) + projected expense amounts
            const txTotal = Math.abs(checkingTransactions.reduce((sum, t) => sum + (t.edited_amount ?? t.amount), 0));
            const peTotal = activeProjected.reduce((sum, pe) => sum + Math.abs(pe.amount), 0);
            this.totalSpent = txTotal + peTotal;

            // Build category breakdown
            this.categoryBreakdown = categories
              .filter(c => c.target_budget && c.target_budget > 0)
              .map(c => {
                const catTxSpent = Math.abs(checkingTransactions
                  .filter(t => t.connelaide_category_id === c.id)
                  .reduce((sum, t) => sum + (t.edited_amount ?? t.amount), 0));

                const catPeSpent = activeProjected
                  .filter(pe => pe.connelaide_category_id === c.id)
                  .reduce((sum, pe) => sum + Math.abs(pe.amount), 0);

                return {
                  name: c.name,
                  budget: c.target_budget!,
                  spent: catTxSpent + catPeSpent
                };
              })
              .sort((a, b) => a.name.localeCompare(b.name));

            this.buildChartData();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private buildChartData(): void {
    const maxVal = Math.max(
      ...this.categoryBreakdown.map(c => Math.max(c.spent, c.budget))
    );
    const half = maxVal * 0.008;

    this.chartData = {
      labels: this.categoryBreakdown.map(c => c.name),
      datasets: [
        {
          label: 'Spent',
          backgroundColor: '#3b82f6',
          data: this.categoryBreakdown.map(c => c.spent)
        },
        {
          label: 'Budget',
          backgroundColor: '#ef4444',
          data: this.categoryBreakdown.map(c => [c.budget - half, c.budget + half]),
          barPercentage: 1.3
        }
      ]
    };
    this.chartOptions = {
      plugins: {
        legend: { labels: { usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              if (ctx.dataset.label === 'Budget') {
                const budgetVal = this.categoryBreakdown[ctx.dataIndex].budget;
                return 'Budget: $' + budgetVal.toFixed(2);
              }
              return ctx.dataset.label + ': $' + ctx.raw.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (val: number) => '$' + val }
        }
      }
    };
  }
}
