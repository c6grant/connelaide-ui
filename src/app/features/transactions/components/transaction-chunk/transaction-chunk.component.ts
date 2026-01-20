import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { Transaction, TransactionChunk } from '../../../../shared/models/transaction.model';
import { TransactionTableComponent } from '../transaction-table/transaction-table.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateRangePipe } from '../../../../shared/pipes/date-range.pipe';

@Component({
  selector: 'app-transaction-chunk',
  standalone: true,
  imports: [PanelModule, TransactionTableComponent, CurrencyFormatPipe, DateRangePipe],
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
    :host ::ng-deep .p-panel .p-panel-header {
      background-color: #f9fafb;
    }
  `]
})
export class TransactionChunkComponent {
  @Input() chunk!: TransactionChunk;
  @Output() chunkToggle = new EventEmitter<boolean>();
  @Output() transactionUpdate = new EventEmitter<Transaction>();

  onToggle(collapsed: boolean) {
    this.chunk.isExpanded = !collapsed;
    this.chunkToggle.emit(this.chunk.isExpanded);
  }

  onTransactionUpdate(transaction: Transaction) {
    this.transactionUpdate.emit(transaction);
  }
}
