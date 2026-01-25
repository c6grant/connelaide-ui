import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Transaction } from '../../../../shared/models/transaction.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { CategoriesService } from '../../../categories/services/categories.service';
import { ConnalaideCategory } from '../../../../shared/models/category.model';

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
    AutoCompleteModule,
    ConfirmDialogModule,
    ToastModule,
    CurrencyFormatPipe
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <p-table
      [value]="transactions"
      [paginator]="transactions.length > 40"
      [rows]="40"
      [rowHover]="true"
      dataKey="id"
      editMode="cell"
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
                <div (keydown.enter)="onCategoryEnter(transaction)">
                  <p-autoComplete
                    [(ngModel)]="transaction.connelaide_category"
                    [suggestions]="filteredCategories"
                    (completeMethod)="filterCategories($event)"
                    [dropdown]="true"
                    [forceSelection]="false"
                    (onFocus)="onEditStart(transaction, 'connelaide_category', transaction.connelaide_category)"
                    (onBlur)="onCategoryBlur(transaction)"
                    styleClass="w-full">
                  </p-autoComplete>
                </div>
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
                  [ngModel]="transaction.edited_amount ?? transaction.amount"
                  (ngModelChange)="onAmountChange(transaction, $event)"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  (onFocus)="onEditStart(transaction, 'edited_amount', transaction.edited_amount)"
                  (onBlur)="onFieldEditIfChanged(transaction, 'edited_amount', transaction.edited_amount)"
                  (onKeyDown)="onAmountKeyDown($event, transaction)">
                </p-inputNumber>
              </ng-template>
              <ng-template pTemplate="output">
                <div class="amount-display">
                  <span [class.negative]="getDisplayAmount(transaction) < 0" [class.positive]="getDisplayAmount(transaction) > 0">
                    {{ getDisplayAmount(transaction) | currencyFormat }}
                  </span>
                  <span class="original-amount" *ngIf="transaction.edited_amount !== null && transaction.edited_amount !== undefined">
                    {{ transaction.amount | currencyFormat }}
                  </span>
                </div>
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
                  (focus)="onEditStart(transaction, 'note', transaction.note)"
                  (blur)="onFieldEditIfChanged(transaction, 'note', transaction.note)"
                  (keydown.enter)="onFieldEditIfChanged(transaction, 'note', transaction.note)"
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
                  (onFocus)="onEditStart(transaction, 'impacts_checking_balance', transaction.impacts_checking_balance)"
                  (onChange)="onFieldEditIfChanged(transaction, 'impacts_checking_balance', transaction.impacts_checking_balance)"
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
      white-space: nowrap;
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
    .amount-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .original-amount {
      font-size: 11px;
      color: #9ca3af;
      text-decoration: line-through;
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

    /* Prevent row height changes during edit */
    :host ::ng-deep .p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {
      height: 40px;
      padding: 0.25rem 0.5rem;
      vertical-align: middle;
    }

    /* Compact input styling for edit mode */
    :host ::ng-deep .p-datatable .p-inputtext {
      padding: 0.25rem 0.5rem;
      font-size: 14px;
      height: 28px;
    }

    :host ::ng-deep .p-datatable .p-inputnumber-input {
      padding: 0.25rem 0.5rem;
      font-size: 14px;
      height: 28px;
    }

    :host ::ng-deep .p-datatable .p-autocomplete .p-inputtext {
      padding: 0.25rem 0.5rem;
      font-size: 14px;
      height: 28px;
    }

    :host ::ng-deep .p-datatable .p-dropdown {
      height: 28px;
    }

    :host ::ng-deep .p-datatable .p-dropdown .p-dropdown-label {
      padding: 0.25rem 0.5rem;
      font-size: 14px;
    }

    /* Fix autocomplete dropdown button height */
    :host ::ng-deep .p-datatable .p-autocomplete {
      height: 28px;
    }

    :host ::ng-deep .p-datatable .p-autocomplete-dropdown {
      height: 28px;
      width: 28px;
      padding: 0;
    }

    /* Fix inputnumber wrapper */
    :host ::ng-deep .p-datatable .p-inputnumber {
      height: 28px;
    }

    /* Prevent date column from wrapping */
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:first-child {
      white-space: nowrap;
    }
  `]
})
export class TransactionTableComponent implements OnInit {
  @Input() transactions: Transaction[] = [];
  @Output() transactionUpdate = new EventEmitter<Transaction>();

  impactsBalanceOptions = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
    { label: 'Review Required', value: 'review_required' }
  ];

  // Category autocomplete
  categories: ConnalaideCategory[] = [];
  filteredCategories: string[] = [];

  // Track original values when editing starts
  private originalValues = new Map<string, unknown>();

  // Track pending blur timeouts for category field
  private categoryBlurTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filterCategories(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories
      .map(c => c.name)
      .filter(name => name.toLowerCase().includes(query));
  }

  onCategoryEnter(transaction: Transaction): void {
    // Cancel any pending blur since Enter was pressed explicitly
    if (this.categoryBlurTimeout) {
      clearTimeout(this.categoryBlurTimeout);
      this.categoryBlurTimeout = null;
    }
    this.onFieldEditIfChanged(transaction, 'connelaide_category', transaction.connelaide_category);
  }

  onCategoryBlur(transaction: Transaction): void {
    // Delay blur handling to allow dropdown selection to complete
    // If user clicks a dropdown item, the blur fires first, then the value updates
    this.categoryBlurTimeout = setTimeout(() => {
      this.categoryBlurTimeout = null;
      this.onFieldEditIfChanged(transaction, 'connelaide_category', transaction.connelaide_category);
    }, 200);
  }

  onEditStart(transaction: Transaction, field: string, value: unknown): void {
    const key = `${transaction.id}:${field}`;
    if (!this.originalValues.has(key)) {
      this.originalValues.set(key, value);
    }
  }

  onFieldEditIfChanged(transaction: Transaction, field: string, currentValue: unknown): void {
    const key = `${transaction.id}:${field}`;

    if (!this.originalValues.has(key)) {
      // For category field: onFocus may not fire reliably in PrimeNG cell editor.
      // Process the category selection anyway - server handles idempotency.
      if (field === 'connelaide_category' && typeof currentValue === 'string' && currentValue.trim()) {
        const existingCategory = this.categories.find(c => c.name === currentValue);
        if (existingCategory) {
          transaction.connelaide_category_id = existingCategory.id;
          transaction.connelaide_category = existingCategory.name;
          this.transactionUpdate.emit(transaction);
        }
        // If category not found, could show create dialog, but skip for now
      }
      return;
    }

    const originalValue = this.originalValues.get(key);
    this.originalValues.delete(key);

    // Only proceed if value actually changed
    if (currentValue === originalValue) {
      return;
    }

    // Handle connelaide_category field with new category creation
    if (field === 'connelaide_category' && typeof currentValue === 'string' && currentValue.trim()) {
      const existingCategory = this.categories.find(c => c.name === currentValue);

      if (!existingCategory) {
        this.confirmationService.confirm({
          message: `Category "${currentValue}" doesn't exist. Create it?`,
          header: 'Create New Category',
          icon: 'pi pi-question-circle',
          accept: () => {
            this.categoriesService.createCategory({ name: currentValue }).subscribe({
              next: (newCategory) => {
                this.categories.push(newCategory);
                // Set both the ID and name on the transaction
                transaction.connelaide_category_id = newCategory.id;
                transaction.connelaide_category = newCategory.name;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Category Created',
                  detail: `Category "${newCategory.name}" has been created.`
                });
                this.transactionUpdate.emit(transaction);
              },
              error: (error) => {
                console.error('Error creating category:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create category.'
                });
                // Revert to original value on error
                (transaction as unknown as Record<string, unknown>)[field] = originalValue;
              }
            });
          },
          reject: () => {
            // Revert to original value
            (transaction as unknown as Record<string, unknown>)[field] = originalValue;
          }
        });
        return;
      }

      // Existing category selected - set the ID
      transaction.connelaide_category_id = existingCategory.id;
      transaction.connelaide_category = existingCategory.name;
    }

    // For existing categories or other fields, emit the update
    this.transactionUpdate.emit(transaction);
  }

  onAmountKeyDown(event: KeyboardEvent, transaction: Transaction) {
    if (event.key === 'Enter') {
      this.onFieldEditIfChanged(transaction, 'edited_amount', transaction.edited_amount);
    }
  }

  getDisplayAmount(transaction: Transaction): number {
    return transaction.edited_amount ?? transaction.amount;
  }

  onAmountChange(transaction: Transaction, newValue: number): void {
    // Clear edited_amount if user reverts to original value
    // Use null (not undefined) so it serializes to JSON and the server clears the field
    transaction.edited_amount = newValue === transaction.amount ? null : newValue;
  }
}
