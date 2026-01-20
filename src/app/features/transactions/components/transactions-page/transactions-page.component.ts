import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TransactionChunkComponent } from '../transaction-chunk/transaction-chunk.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';
import { Transaction, TransactionChunk } from '../../../../shared/models/transaction.model';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionChunkService, HalfMonthPeriod } from '../../services/transaction-chunk.service';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NgIf, NgFor, TransactionChunkComponent, LoadingSpinnerComponent],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <h1>Transactions</h1>
        <p>View and manage your transactions organized by half-month periods.</p>
      </div>

      <div class="transactions-content" *ngIf="!initialLoading; else loadingTemplate">
        <ng-container *ngIf="chunks.length > 0; else noTransactions">
          <app-transaction-chunk
            *ngFor="let chunk of chunks; let i = index"
            [chunk]="chunk"
            (chunkToggle)="onChunkToggle(i, $event)"
            (transactionUpdate)="onTransactionUpdate($event)">
          </app-transaction-chunk>

          <div class="load-more-container">
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
    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
    }
    .page-header p {
      margin: 0;
      color: #6b7280;
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
  `]
})
export class TransactionsPageComponent implements OnInit {
  chunks: TransactionChunk[] = [];
  initialLoading = true;
  loadingMore = false;
  error: string | null = null;
  private currentPeriod: HalfMonthPeriod | null = null;

  constructor(
    private transactionsService: TransactionsService,
    private chunkService: TransactionChunkService
  ) {}

  ngOnInit() {
    this.loadInitialTransactions();
  }

  loadInitialTransactions() {
    this.initialLoading = true;
    this.error = null;

    // Calculate current half-month period
    this.currentPeriod = this.chunkService.getHalfMonthPeriod(new Date());

    const startDate = this.chunkService.formatDateForApi(this.currentPeriod.start);
    const endDate = this.chunkService.formatDateForApi(this.currentPeriod.end);

    this.transactionsService.getTransactions(startDate, endDate).subscribe({
      next: (transactions) => {
        const chunk = this.chunkService.createChunkFromPeriod(transactions, this.currentPeriod!);
        chunk.isExpanded = true; // Expand first chunk by default
        this.chunks = [chunk];
        this.initialLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions. Please try again.';
        this.initialLoading = false;
      }
    });
  }

  loadMoreTransactions() {
    if (!this.currentPeriod || this.loadingMore) {
      return;
    }

    this.loadingMore = true;

    // Get the previous period
    const previousPeriod = this.chunkService.getPreviousPeriod(this.currentPeriod.start);
    const startDate = this.chunkService.formatDateForApi(previousPeriod.start);
    const endDate = this.chunkService.formatDateForApi(previousPeriod.end);

    this.transactionsService.getTransactions(startDate, endDate).subscribe({
      next: (transactions) => {
        const chunk = this.chunkService.createChunkFromPeriod(transactions, previousPeriod);
        this.chunks.push(chunk);
        this.currentPeriod = previousPeriod;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = 'Failed to load more transactions. Please try again.';
        this.loadingMore = false;
      }
    });
  }

  onChunkToggle(index: number, expanded: boolean) {
    this.chunks[index].isExpanded = expanded;
  }

  onTransactionUpdate(transaction: Transaction) {
    this.transactionsService.updateTransaction(transaction.id, transaction).subscribe({
      next: () => {
        // Transaction updated successfully
      },
      error: (err) => {
        this.error = 'Failed to update transaction: ' + err.message;
      }
    });
  }
}
