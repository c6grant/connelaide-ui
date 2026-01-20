import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
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
    CalendarModule,
    ButtonModule,
    CurrencyFormatPipe
  ],
  template: `
    <p-table
      [value]="transactions"
      [paginator]="transactions.length > 10"
      [rows]="10"
      [rowHover]="true"
      dataKey="id"
      editMode="row"
      styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th style="text-align: right">Amount</th>
          <th style="width: 100px">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-transaction let-editing="editing" let-ri="rowIndex">
        <tr [pEditableRow]="transaction">
          <td>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <p-calendar
                  [(ngModel)]="transaction.date"
                  dateFormat="yy-mm-dd"
                  [showIcon]="true"
                  inputStyleClass="w-full">
                </p-calendar>
              </ng-template>
              <ng-template pTemplate="output">
                {{ transaction.date }}
              </ng-template>
            </p-cellEditor>
          </td>
          <td>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="transaction.description"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                {{ transaction.description }}
                <span class="merchant-name" *ngIf="transaction.merchant_name">
                  ({{ transaction.merchant_name }})
                </span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="transaction.category"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                <span class="category-badge">{{ transaction.category }}</span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td style="text-align: right">
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
            <div class="action-buttons">
              <button
                *ngIf="!editing"
                pButton
                pRipple
                type="button"
                pInitEditableRow
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text"
                (click)="onRowEditInit(transaction)">
              </button>
              <button
                *ngIf="editing"
                pButton
                pRipple
                type="button"
                pSaveEditableRow
                icon="pi pi-check"
                class="p-button-rounded p-button-text p-button-success"
                (click)="onRowEditSave(transaction)">
              </button>
              <button
                *ngIf="editing"
                pButton
                pRipple
                type="button"
                pCancelEditableRow
                icon="pi pi-times"
                class="p-button-rounded p-button-text p-button-danger"
                (click)="onRowEditCancel(transaction, ri)">
              </button>
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="5" class="empty-message">No transactions in this period.</td>
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
    .negative {
      color: #dc2626;
    }
    .positive {
      color: #059669;
    }
    .action-buttons {
      display: flex;
      gap: 4px;
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

  private clonedTransactions: { [id: string]: Transaction } = {};

  onRowEditInit(transaction: Transaction) {
    this.clonedTransactions[transaction.id] = { ...transaction };
  }

  onRowEditSave(transaction: Transaction) {
    delete this.clonedTransactions[transaction.id];
    this.transactionUpdate.emit(transaction);
  }

  onRowEditCancel(transaction: Transaction, index: number) {
    this.transactions[index] = this.clonedTransactions[transaction.id];
    delete this.clonedTransactions[transaction.id];
  }
}
