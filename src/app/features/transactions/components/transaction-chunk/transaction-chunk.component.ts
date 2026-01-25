import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { NgIf, CurrencyPipe } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { Transaction, TransactionChunk } from '../../../../shared/models/transaction.model';
import { TransactionTableComponent } from '../transaction-table/transaction-table.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateRangePipe } from '../../../../shared/pipes/date-range.pipe';

@Component({
  selector: 'app-transaction-chunk',
  standalone: true,
  imports: [NgIf, CurrencyPipe, PanelModule, TransactionTableComponent, CurrencyFormatPipe, DateRangePipe],
  template: `
    <p-panel
      [header]="chunk.startDate | dateRange: chunk.endDate"
      [toggleable]="true"
      [collapsed]="!chunk.isExpanded"
      (collapsedChange)="onToggle($event)">
      <ng-template pTemplate="headericons">
        <div class="chunk-summary">
          <span class="transaction-count">{{ chunk.transactions.length }} transactions</span>
          <span class="total-amount" [class.negative]="chunk.totalAmount < 0">
            {{ chunk.totalAmount | currencyFormat }}
          </span>
        </div>
      </ng-template>
      <div class="budget-summary" *ngIf="chunk.checkingBudget">
        <div class="budget-item">
          <span class="budget-label">Checking Budget</span>
          <span class="budget-value">{{ chunk.checkingBudget | currency }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-label">Amount Spent</span>
          <span class="budget-value spent">{{ amountSpent | currency }}</span>
        </div>
        <div class="budget-item primary">
          <span class="budget-label">Amount Remaining</span>
          <span class="budget-value remaining" [class.negative]="amountRemaining < 0">
            {{ amountRemaining | currency }}
          </span>
        </div>
      </div>
      <app-transaction-table
        [transactions]="chunk.transactions"
        (transactionUpdate)="onTransactionUpdate($event)">
      </app-transaction-table>
    </p-panel>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 16px;
    }
    .chunk-summary {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-right: 8px;
    }
    .transaction-count {
      font-size: 14px;
      color: #6b7280;
    }
    .total-amount {
      font-size: 16px;
      font-weight: 600;
      color: #059669;
    }
    .total-amount.negative {
      color: #dc2626;
    }
    /* Make entire header clickable */
    :host ::ng-deep .p-panel .p-panel-header {
      background-color: #f9fafb;
      cursor: pointer;
    }
    /* Ensure header icons area doesn't get truncated */
    :host ::ng-deep .p-panel .p-panel-icons {
      flex-shrink: 0;
    }
    /* Ensure title can shrink but icons stay visible */
    :host ::ng-deep .p-panel .p-panel-title {
      flex: 1;
      min-width: 0;
    }
    .budget-summary {
      display: flex;
      gap: 16px;
      padding: 16px;
      margin-bottom: 16px;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .budget-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .budget-item.primary {
      background-color: #eff6ff;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #bfdbfe;
    }
    .budget-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .budget-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    .budget-value.spent {
      color: #dc2626;
    }
    .budget-value.remaining {
      color: #059669;
      font-size: 20px;
    }
    .budget-value.remaining.negative {
      color: #dc2626;
    }
  `]
})
export class TransactionChunkComponent implements AfterViewInit {
  @Input() chunk!: TransactionChunk;
  @Output() chunkToggle = new EventEmitter<boolean>();
  @Output() transactionUpdate = new EventEmitter<Transaction>();

  constructor(private elementRef: ElementRef) {}

  get amountSpent(): number {
    return Math.abs(
      this.chunk.transactions
        .filter(tx => tx.impacts_checking_balance === 'true')
        .reduce((sum, tx) => sum + (tx.edited_amount ?? tx.amount), 0)
    );
  }

  get amountRemaining(): number {
    return (this.chunk.checkingBudget ?? 0) - this.amountSpent;
  }

  ngAfterViewInit() {
    // Make entire header clickable to toggle panel
    const headerEl = this.elementRef.nativeElement.querySelector('.p-panel-header');
    if (headerEl) {
      headerEl.addEventListener('click', (e: MouseEvent) => {
        // Don't toggle if clicking on the toggler button itself (it already handles that)
        if (!(e.target as HTMLElement).closest('.p-panel-toggler')) {
          this.chunk.isExpanded = !this.chunk.isExpanded;
          this.chunkToggle.emit(this.chunk.isExpanded);
        }
      });
    }
  }

  onToggle(collapsed: boolean) {
    this.chunk.isExpanded = !collapsed;
    this.chunkToggle.emit(this.chunk.isExpanded);
  }

  onTransactionUpdate(transaction: Transaction) {
    this.transactionUpdate.emit(transaction);
  }
}
