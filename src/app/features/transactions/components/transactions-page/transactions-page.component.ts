import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TransactionChunkComponent } from '../transaction-chunk/transaction-chunk.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { Transaction, TransactionChunk, TransactionUpdate } from '../../../../shared/models/transaction.model';
import { ProjectedExpense } from '../../../../shared/models/projected-expense.model';
import { PayPeriod } from '../../../../shared/models/pay-period.model';
import { ConnalaideCategory } from '../../../../shared/models/category.model';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionChunkService } from '../../services/transaction-chunk.service';
import { PayPeriodsService } from '../../../pay-periods/services/pay-periods.service';
import { ProjectedExpensesService } from '../../services/projected-expenses.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { RecurringExpenseCreate } from '../../../../shared/models/recurring-expense.model';
import { RecurringExpensesService } from '../../../recurring-expenses/services/recurring-expenses.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, FormsModule, RouterLink,
    DialogModule, ButtonModule, InputTextModule, InputNumberModule, CalendarModule, AutoCompleteModule,
    TransactionChunkComponent, LoadingSpinnerComponent
  ],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Transactions</h1>
          <p>View and manage your transactions organized by pay periods.</p>
        </div>
        <div class="header-actions">
          <span class="last-refreshed" *ngIf="lastRefreshedAt">
            Last refreshed: {{ lastRefreshedAt | date:'short' }}
          </span>
          <button
            class="refresh-btn"
            (click)="onRefreshTransactions()"
            [disabled]="refreshing">
            <i class="pi pi-refresh" [class.pi-spin]="refreshing"></i>
            {{ refreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div class="transactions-content" *ngIf="!initialLoading; else loadingTemplate">
        <ng-container *ngIf="!noPayPeriods; else noPayPeriodsTemplate">
          <ng-container *ngIf="chunks.length > 0; else noTransactions">
            <app-transaction-chunk
              *ngFor="let chunk of chunks; let i = index"
              [chunk]="chunk"
              (chunkToggle)="onChunkToggle(i, $event)"
              (transactionUpdate)="onTransactionUpdate($event)"
              (projectedExpenseUpdate)="onProjectedExpenseUpdate($event)"
              (projectedExpenseDelete)="onProjectedExpenseDelete($event, i)"
              (projectedExpenseMerge)="onProjectedExpenseMerge($event, i)"
              (addProjectedExpense)="onAddProjectedExpense(i)"
              (createRecurringExpense)="onCreateRecurringExpense($event)">
            </app-transaction-chunk>

            <div class="load-more-container" *ngIf="hasMorePayPeriods">
              <button
                class="load-more-btn"
                (click)="loadMoreTransactions()"
                [disabled]="loadingMore">
                <span *ngIf="!loadingMore">Load More</span>
                <span *ngIf="loadingMore">Loading...</span>
              </button>
            </div>
          </ng-container>
          <ng-template #noTransactions>
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <h3>No transactions yet</h3>
              <p>Your transactions will appear here once they're synced.</p>
            </div>
          </ng-template>
        </ng-container>
        <ng-template #noPayPeriodsTemplate>
          <div class="empty-state">
            <i class="pi pi-calendar"></i>
            <h3>No pay periods defined</h3>
            <p>You need to create pay periods before viewing transactions.</p>
            <a routerLink="/pay-periods" class="setup-link">
              Set up Pay Periods
            </a>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTemplate>
        <app-loading-spinner></app-loading-spinner>
      </ng-template>

      <div class="error-message" *ngIf="error">
        {{ error }}
      </div>
    </div>

    <!-- Add Projected Expense Dialog -->
    <p-dialog
      header="Add Projected Expense"
      [(visible)]="addDialogVisible"
      [modal]="true"
      [style]="{ width: '500px' }"
      [dismissableMask]="true">
      <div class="add-form" *ngIf="addDialogVisible">
        <div class="form-field">
          <label for="pe-name">Name *</label>
          <input
            pInputText
            id="pe-name"
            [(ngModel)]="newExpense.name"
            placeholder="e.g. Rent, Car Payment"
            class="w-full" />
        </div>
        <div class="form-field">
          <label for="pe-amount">Amount *</label>
          <p-inputNumber
            [(ngModel)]="newExpense.amount"
            mode="currency"
            currency="USD"
            locale="en-US"
            inputId="pe-amount"
            styleClass="w-full">
          </p-inputNumber>
        </div>
        <div class="form-field">
          <label for="pe-date">Date *</label>
          <p-calendar
            [(ngModel)]="newExpenseDate"
            [showIcon]="true"
            dateFormat="yy-mm-dd"
            inputId="pe-date"
            styleClass="w-full"
            [minDate]="addDialogMinDate"
            [maxDate]="addDialogMaxDate"
            [appendTo]="'body'">
          </p-calendar>
        </div>
        <div class="form-field">
          <label for="pe-category">Category</label>
          <p-autoComplete
            [(ngModel)]="newExpenseCategoryName"
            [suggestions]="filteredCategories"
            (completeMethod)="filterCategories($event)"
            [dropdown]="true"
            [forceSelection]="false"
            inputId="pe-category"
            styleClass="w-full"
            [appendTo]="'body'">
          </p-autoComplete>
        </div>
        <div class="form-field">
          <label for="pe-note">Note</label>
          <input
            pInputText
            id="pe-note"
            [(ngModel)]="newExpense.note"
            placeholder="Optional note"
            class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          label="Cancel"
          class="p-button-text"
          (click)="addDialogVisible = false">
        </button>
        <button
          pButton
          type="button"
          label="Create"
          icon="pi pi-check"
          [disabled]="!newExpense.name || !newExpense.amount || !newExpenseDate"
          (click)="onSubmitProjectedExpense()">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .transactions-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
    }
    .header-content p {
      margin: 0;
      color: #6b7280;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .last-refreshed {
      font-size: 13px;
      color: #6b7280;
    }
    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
      background-color: #3b82f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .refresh-btn:hover:not(:disabled) {
      background-color: #2563eb;
    }
    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .refresh-btn i {
      font-size: 14px;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .pi-spin {
      animation: spin 1s linear infinite;
    }
    .transactions-content {
      display: flex;
      flex-direction: column;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .empty-state i {
      font-size: 48px;
      color: #d1d5db;
      margin-bottom: 16px;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #4b5563;
    }
    .empty-state p {
      margin: 0;
      color: #9ca3af;
    }
    .error-message {
      color: #dc2626;
      padding: 16px;
      background-color: #fee2e2;
      border-radius: 8px;
      border: 1px solid #fecaca;
    }
    .load-more-container {
      display: flex;
      justify-content: center;
      padding: 24px 0;
    }
    .load-more-btn {
      padding: 12px 32px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      background-color: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .load-more-btn:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    .load-more-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .setup-link {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 24px;
      background-color: #3b82f6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    .setup-link:hover {
      background-color: #2563eb;
    }

    /* Add form styles */
    .add-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-field label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .w-full {
      width: 100%;
    }
  `]
})
export class TransactionsPageComponent implements OnInit {
  chunks: TransactionChunk[] = [];
  initialLoading = true;
  loadingMore = false;
  refreshing = false;
  lastRefreshedAt: Date | null = null;
  error: string | null = null;
  noPayPeriods = false;
  hasMorePayPeriods = false;

  // Add projected expense dialog
  addDialogVisible = false;
  addDialogChunkIndex = -1;
  addDialogMinDate = new Date();
  addDialogMaxDate = new Date();
  newExpense = { name: '', amount: 0, note: '' };
  newExpenseDate: Date | null = null;
  newExpenseCategoryName: string = '';
  categories: ConnalaideCategory[] = [];
  filteredCategories: string[] = [];

  private payPeriods: PayPeriod[] = [];
  private currentPayPeriodIndex = 0;

  constructor(
    private transactionsService: TransactionsService,
    private chunkService: TransactionChunkService,
    private payPeriodsService: PayPeriodsService,
    private projectedExpensesService: ProjectedExpensesService,
    private categoriesService: CategoriesService,
    private recurringExpensesService: RecurringExpensesService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadRefreshStatus();
    this.loadPayPeriodsAndTransactions();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: () => {} // Non-critical
    });
  }

  filterCategories(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories
      .map(c => c.name)
      .filter(name => name.toLowerCase().includes(query));
  }

  loadRefreshStatus() {
    this.transactionsService.getRefreshStatus().subscribe({
      next: (status) => {
        this.lastRefreshedAt = status.last_refreshed_at
          ? new Date(status.last_refreshed_at)
          : null;
      },
      error: () => {
        // Silently fail - refresh status is not critical
      }
    });
  }

  loadPayPeriodsAndTransactions() {
    this.initialLoading = true;
    this.error = null;
    this.noPayPeriods = false;

    this.payPeriodsService.getPayPeriods().subscribe({
      next: (payPeriods) => {
        this.payPeriods = payPeriods;

        if (payPeriods.length === 0) {
          this.noPayPeriods = true;
          this.initialLoading = false;
          return;
        }

        this.hasMorePayPeriods = payPeriods.length > 1;
        this.currentPayPeriodIndex = 0;
        this.loadTransactionsForPayPeriod(payPeriods[0], true);
      },
      error: (err) => {
        this.error = 'Failed to load pay periods. Please try again.';
        this.initialLoading = false;
      }
    });
  }

  loadTransactionsForPayPeriod(payPeriod: PayPeriod, isFirst: boolean) {
    forkJoin({
      transactions: this.transactionsService.getTransactions(payPeriod.start_date, payPeriod.end_date),
      projectedExpenses: this.projectedExpensesService.getProjectedExpenses(payPeriod.start_date, payPeriod.end_date)
        .pipe(catchError(() => of([] as ProjectedExpense[])))
    }).subscribe({
      next: ({ transactions, projectedExpenses }) => {
        const chunk = this.chunkService.createChunkFromPayPeriod(transactions, payPeriod);
        chunk.projectedExpenses = projectedExpenses;
        if (isFirst) {
          chunk.isExpanded = true;
          this.chunks = [chunk];
        } else {
          this.chunks.push(chunk);
        }
        this.initialLoading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions. Please try again.';
        this.initialLoading = false;
        this.loadingMore = false;
      }
    });
  }

  onRefreshTransactions() {
    if (this.refreshing) {
      return;
    }

    this.refreshing = true;
    this.error = null;

    this.transactionsService.refreshTransactions().subscribe({
      next: (response) => {
        this.refreshing = false;
        if (response.success) {
          this.lastRefreshedAt = response.last_refreshed_at
            ? new Date(response.last_refreshed_at)
            : new Date();
          this.loadPayPeriodsAndTransactions();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.refreshing = false;
        this.error = 'Failed to refresh transactions. Please try again.';
      }
    });
  }

  loadMoreTransactions() {
    if (this.loadingMore || this.currentPayPeriodIndex >= this.payPeriods.length - 1) {
      return;
    }

    this.loadingMore = true;
    this.currentPayPeriodIndex++;

    const nextPayPeriod = this.payPeriods[this.currentPayPeriodIndex];
    this.hasMorePayPeriods = this.currentPayPeriodIndex < this.payPeriods.length - 1;

    this.loadTransactionsForPayPeriod(nextPayPeriod, false);
  }

  onChunkToggle(index: number, expanded: boolean) {
    this.chunks[index].isExpanded = expanded;
  }

  onTransactionUpdate(transaction: Transaction) {
    const updates: TransactionUpdate = {
      connelaide_category_id: transaction.connelaide_category_id,
      edited_amount: transaction.edited_amount,
      note: transaction.note,
      impacts_checking_balance: transaction.impacts_checking_balance
    };

    this.transactionsService.updateTransaction(transaction.id, updates).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Transaction updated',
          life: 3000
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save changes',
          life: 5000
        });
      }
    });
  }

  // ========== Projected Expense Events ==========

  onProjectedExpenseUpdate(expense: ProjectedExpense) {
    const updates: Record<string, unknown> = {
      name: expense.name,
      amount: expense.amount,
      connelaide_category_id: expense.connelaide_category_id,
      note: expense.note,
      is_struck_out: expense.is_struck_out
    };

    this.projectedExpensesService.updateProjectedExpense(expense.id, updates).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Projected expense updated',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update projected expense',
          life: 5000
        });
      }
    });
  }

  onProjectedExpenseDelete(expense: ProjectedExpense, chunkIndex: number) {
    this.projectedExpensesService.deleteProjectedExpense(expense.id).subscribe({
      next: () => {
        const chunk = this.chunks[chunkIndex];
        chunk.projectedExpenses = chunk.projectedExpenses.filter(pe => pe.id !== expense.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Projected expense removed',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete projected expense',
          life: 5000
        });
      }
    });
  }

  onProjectedExpenseMerge(event: { projected: ProjectedExpense; transactionId: number }, chunkIndex: number) {
    this.projectedExpensesService.updateProjectedExpense(event.projected.id, {
      merged_transaction_id: event.transactionId
    }).subscribe({
      next: () => {
        const chunk = this.chunks[chunkIndex];
        chunk.projectedExpenses = chunk.projectedExpenses.filter(pe => pe.id !== event.projected.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Merged',
          detail: 'Projected expense merged with transaction',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to merge projected expense',
          life: 5000
        });
      }
    });
  }

  onAddProjectedExpense(chunkIndex: number) {
    this.addDialogChunkIndex = chunkIndex;
    const chunk = this.chunks[chunkIndex];

    // Set date constraints to the pay period range
    this.addDialogMinDate = chunk.startDate;
    this.addDialogMaxDate = chunk.endDate;

    // Pre-fill date to today if within range, otherwise start of period
    const today = new Date();
    if (today >= chunk.startDate && today <= chunk.endDate) {
      this.newExpenseDate = today;
    } else {
      this.newExpenseDate = new Date(chunk.startDate);
    }

    this.newExpense = { name: '', amount: 0, note: '' };
    this.newExpenseCategoryName = '';
    this.addDialogVisible = true;
  }

  onSubmitProjectedExpense() {
    if (!this.newExpense.name || !this.newExpense.amount || !this.newExpenseDate) {
      return;
    }

    // Format date as YYYY-MM-DD
    const year = this.newExpenseDate.getFullYear();
    const month = String(this.newExpenseDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.newExpenseDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Resolve category
    let categoryId: number | undefined;
    if (this.newExpenseCategoryName) {
      const existing = this.categories.find(c => c.name === this.newExpenseCategoryName);
      if (existing) {
        categoryId = existing.id;
      }
    }

    const createData = {
      name: this.newExpense.name,
      amount: this.newExpense.amount,
      date: dateStr,
      connelaide_category_id: categoryId,
      note: this.newExpense.note || undefined
    };

    this.projectedExpensesService.createProjectedExpense(createData).subscribe({
      next: (created) => {
        const chunk = this.chunks[this.addDialogChunkIndex];
        chunk.projectedExpenses = [...chunk.projectedExpenses, created];
        this.addDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Projected expense added',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create projected expense',
          life: 5000
        });
      }
    });
  }

  // ========== Recurring Expense ==========

  onCreateRecurringExpense(data: RecurringExpenseCreate) {
    this.recurringExpensesService.createRecurringExpense(data).subscribe({
      next: (created) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: `Recurring expense "${created.name}" created`,
          life: 3000
        });
      },
      error: (err) => {
        const detail = err.error?.detail || 'Failed to create recurring expense';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 5000
        });
      }
    });
  }
}
