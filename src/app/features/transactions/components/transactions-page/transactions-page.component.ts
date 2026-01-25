import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionChunkComponent } from '../transaction-chunk/transaction-chunk.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { Transaction, TransactionChunk, TransactionUpdate } from '../../../../shared/models/transaction.model';
import { PayPeriod } from '../../../../shared/models/pay-period.model';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionChunkService } from '../../services/transaction-chunk.service';
import { PayPeriodsService } from '../../../pay-periods/services/pay-periods.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink, TransactionChunkComponent, LoadingSpinnerComponent],
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
              (transactionUpdate)="onTransactionUpdate($event)">
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

  private payPeriods: PayPeriod[] = [];
  private currentPayPeriodIndex = 0;

  constructor(
    private transactionsService: TransactionsService,
    private chunkService: TransactionChunkService,
    private payPeriodsService: PayPeriodsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadRefreshStatus();
    this.loadPayPeriodsAndTransactions();
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
    this.transactionsService.getTransactions(payPeriod.start_date, payPeriod.end_date).subscribe({
      next: (transactions) => {
        const chunk = this.chunkService.createChunkFromPayPeriod(transactions, payPeriod);
        if (isFirst) {
          chunk.isExpanded = true; // Expand first chunk by default
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
          // Reload transactions to show new data
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
    // Build update object with only the editable fields
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
}
