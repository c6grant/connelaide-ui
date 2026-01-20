import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Panel, PanelModule } from 'primeng/panel';
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
      #panel
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
  `]
})
export class TransactionChunkComponent implements AfterViewInit {
  @Input() chunk!: TransactionChunk;
  @Output() chunkToggle = new EventEmitter<boolean>();
  @Output() transactionUpdate = new EventEmitter<Transaction>();

  @ViewChild('panel') panel!: Panel;

  ngAfterViewInit() {
    // Make entire header clickable to toggle panel
    const headerEl = this.panel.el.nativeElement.querySelector('.p-panel-header');
    if (headerEl) {
      headerEl.addEventListener('click', (e: Event) => {
        // Don't toggle if clicking on the toggler button itself (it already handles that)
        if (!(e.target as HTMLElement).closest('.p-panel-toggler')) {
          this.panel.toggle(e);
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
