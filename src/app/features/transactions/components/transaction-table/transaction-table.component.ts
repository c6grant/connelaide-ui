import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { Transaction } from '../../../../shared/models/transaction.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CurrencyFormatPipe
  ],
  template: `
    <p-table
      [value]="transactions"
      [paginator]="transactions.length > 40"
      [rows]="40"
      [rowHover]="true"
      dataKey="id"
      editMode="cell"
      (onEditComplete)="onCellEditComplete($event)"
      styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr>
          <th>Date</th>
          <th>Account</th>
          <th>Description</th>
          <th>Category</th>
          <th>Connelaide Category</th>
          <th style="text-align: right">Amount</th>
          <th>Pending</th>
          <th>Note</th>
          <th>Impacts Balance</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-transaction let-editing="editing" let-ri="rowIndex">
        <tr>
          <td>
            {{ transaction.date }}
          </td>
          <td>
            {{ transaction.account_name }}
          </td>
          <td>
            {{ transaction.description }}
            <span class="merchant-name" *ngIf="transaction.merchant_name">
              ({{ transaction.merchant_name }})
            </span>
          </td>
          <td>
            <span class="category-badge">{{ transaction.category }}</span>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="transaction.connelaide_category"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                <span class="category-badge" *ngIf="transaction.connelaide_category">{{ transaction.connelaide_category }}</span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td pEditableColumn style="text-align: right">
            <p-cellEditor>
              <ng-template pTemplate="input">
                <p-inputNumber
                  [(ngModel)]="transaction.amount"
                  mode="currency"
                  currency="USD"
                  locale="en-US">
                </p-inputNumber>
              </ng-template>
              <ng-template pTemplate="output">
                <span [class.negative]="transaction.amount < 0" [class.positive]="transaction.amount > 0">
                  {{ transaction.amount | currencyFormat }}
                </span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td>
            <span class="pending-badge" *ngIf="transaction.pending">Pending</span>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="transaction.note"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                {{ transaction.note }}
              </ng-template>
            </p-cellEditor>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <p-dropdown
                  [(ngModel)]="transaction.impacts_checking_balance"
                  [options]="impactsBalanceOptions"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full">
                </p-dropdown>
              </ng-template>
              <ng-template pTemplate="output">
                <span [class]="'impacts-badge impacts-' + transaction.impacts_checking_balance">
                  {{ transaction.impacts_checking_balance }}
                </span>
              </ng-template>
            </p-cellEditor>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="9" class="empty-message">No transactions in this period.</td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background-color: #f9fafb;
      color: #6b7280;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
    }
    .merchant-name {
      color: #9ca3af;
      font-size: 12px;
    }
    .category-badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      font-size: 12px;
      color: #4b5563;
    }
    .pending-badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #fef3c7;
      border-radius: 4px;
      font-size: 12px;
      color: #92400e;
    }
    .impacts-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .impacts-true {
      background-color: #d1fae5;
      color: #065f46;
    }
    .impacts-false {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .impacts-review_required {
      background-color: #fef3c7;
      color: #92400e;
    }
    .negative {
      color: #dc2626;
    }
    .positive {
      color: #059669;
    }
    :host ::ng-deep .p-datatable .p-editable-column {
      cursor: pointer;
    }
    :host ::ng-deep .p-datatable .p-editable-column:hover {
      background-color: #f3f4f6;
    }
    .empty-message {
      text-align: center;
      color: #9ca3af;
      padding: 20px;
    }
    .w-full {
      width: 100%;
    }
  `]
})
export class TransactionTableComponent {
  @Input() transactions: Transaction[] = [];
  @Output() transactionUpdate = new EventEmitter<Transaction>();

  impactsBalanceOptions = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
    { label: 'Review Required', value: 'review_required' }
  ];

  onCellEditComplete(event: { data?: Transaction }) {
    if (event.data) {
      this.transactionUpdate.emit(event.data);
    }
  }
}
