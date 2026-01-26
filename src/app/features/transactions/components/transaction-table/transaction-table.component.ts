import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Transaction } from '../../../../shared/models/transaction.model';
import { ProjectedExpense } from '../../../../shared/models/projected-expense.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { CategoriesService } from '../../../categories/services/categories.service';
import { ConnalaideCategory } from '../../../../shared/models/category.model';

export interface DisplayRow {
  type: 'transaction' | 'projected';
  date: string;
  data: Transaction | ProjectedExpense;
}

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    AutoCompleteModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    CurrencyFormatPipe
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <p-table
      [value]="displayRows"
      [paginator]="displayRows.length > 40"
      [rows]="40"
      [rowHover]="true"
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
          <th style="width: 100px">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row let-ri="rowIndex">
        <!-- Transaction row -->
        <tr *ngIf="row.type === 'transaction'">
          <td>{{ asTransaction(row.data).date }}</td>
          <td>{{ asTransaction(row.data).account_name }}</td>
          <td>
            {{ asTransaction(row.data).description }}
            <span class="merchant-name" *ngIf="asTransaction(row.data).merchant_name">
              ({{ asTransaction(row.data).merchant_name }})
            </span>
          </td>
          <td>
            <span class="category-badge">{{ asTransaction(row.data).category }}</span>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <div (keydown.enter)="onCategoryEnter(asTransaction(row.data))">
                  <p-autoComplete
                    [(ngModel)]="asTransaction(row.data).connelaide_category"
                    [suggestions]="filteredCategories"
                    (completeMethod)="filterCategories($event)"
                    [dropdown]="true"
                    [forceSelection]="false"
                    (onFocus)="onEditStart(asTransaction(row.data), 'connelaide_category', asTransaction(row.data).connelaide_category)"
                    (onBlur)="onCategoryBlur(asTransaction(row.data))"
                    styleClass="w-full">
                  </p-autoComplete>
                </div>
              </ng-template>
              <ng-template pTemplate="output">
                <span class="category-badge" *ngIf="asTransaction(row.data).connelaide_category">{{ asTransaction(row.data).connelaide_category }}</span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td pEditableColumn style="text-align: right">
            <p-cellEditor>
              <ng-template pTemplate="input">
                <p-inputNumber
                  [ngModel]="asTransaction(row.data).edited_amount ?? asTransaction(row.data).amount"
                  (ngModelChange)="onAmountChange(asTransaction(row.data), $event)"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  (onFocus)="onEditStart(asTransaction(row.data), 'edited_amount', asTransaction(row.data).edited_amount)"
                  (onBlur)="onFieldEditIfChanged(asTransaction(row.data), 'edited_amount', asTransaction(row.data).edited_amount)"
                  (onKeyDown)="onAmountKeyDown($event, asTransaction(row.data))">
                </p-inputNumber>
              </ng-template>
              <ng-template pTemplate="output">
                <div class="amount-display">
                  <span [class.negative]="getDisplayAmount(asTransaction(row.data)) < 0" [class.positive]="getDisplayAmount(asTransaction(row.data)) > 0">
                    {{ getDisplayAmount(asTransaction(row.data)) | currencyFormat }}
                  </span>
                  <span class="original-amount" *ngIf="asTransaction(row.data).edited_amount !== null && asTransaction(row.data).edited_amount !== undefined">
                    {{ asTransaction(row.data).amount | currencyFormat }}
                  </span>
                </div>
              </ng-template>
            </p-cellEditor>
          </td>
          <td>
            <span class="pending-badge" *ngIf="asTransaction(row.data).pending">Pending</span>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="asTransaction(row.data).note"
                  (focus)="onEditStart(asTransaction(row.data), 'note', asTransaction(row.data).note)"
                  (blur)="onFieldEditIfChanged(asTransaction(row.data), 'note', asTransaction(row.data).note)"
                  (keydown.enter)="onFieldEditIfChanged(asTransaction(row.data), 'note', asTransaction(row.data).note)"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                {{ asTransaction(row.data).note }}
              </ng-template>
            </p-cellEditor>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <p-dropdown
                  [(ngModel)]="asTransaction(row.data).impacts_checking_balance"
                  [options]="impactsBalanceOptions"
                  optionLabel="label"
                  optionValue="value"
                  (onFocus)="onEditStart(asTransaction(row.data), 'impacts_checking_balance', asTransaction(row.data).impacts_checking_balance)"
                  (onChange)="onFieldEditIfChanged(asTransaction(row.data), 'impacts_checking_balance', asTransaction(row.data).impacts_checking_balance)"
                  styleClass="w-full">
                </p-dropdown>
              </ng-template>
              <ng-template pTemplate="output">
                <span [class]="'impacts-badge impacts-' + asTransaction(row.data).impacts_checking_balance">
                  {{ asTransaction(row.data).impacts_checking_balance }}
                </span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td></td>
        </tr>
        <!-- Projected expense row -->
        <tr *ngIf="row.type === 'projected'"
            [class.projected-row]="true"
            [class.struck-out]="asProjected(row.data).is_struck_out">
          <td>{{ asProjected(row.data).date }}</td>
          <td>
            <span class="projected-badge">Projected</span>
          </td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="asProjected(row.data).name"
                  (focus)="onProjectedEditStart(asProjected(row.data), 'name', asProjected(row.data).name)"
                  (blur)="onProjectedFieldEditIfChanged(asProjected(row.data), 'name', asProjected(row.data).name)"
                  (keydown.enter)="onProjectedFieldEditIfChanged(asProjected(row.data), 'name', asProjected(row.data).name)"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                {{ asProjected(row.data).name }}
              </ng-template>
            </p-cellEditor>
          </td>
          <td></td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <div (keydown.enter)="onProjectedCategoryEnter(asProjected(row.data))">
                  <p-autoComplete
                    [(ngModel)]="asProjected(row.data).connelaide_category"
                    [suggestions]="filteredCategories"
                    (completeMethod)="filterCategories($event)"
                    [dropdown]="true"
                    [forceSelection]="false"
                    (onFocus)="onProjectedEditStart(asProjected(row.data), 'connelaide_category', asProjected(row.data).connelaide_category)"
                    (onBlur)="onProjectedCategoryBlur(asProjected(row.data))"
                    styleClass="w-full">
                  </p-autoComplete>
                </div>
              </ng-template>
              <ng-template pTemplate="output">
                <span class="category-badge" *ngIf="asProjected(row.data).connelaide_category">{{ asProjected(row.data).connelaide_category }}</span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td pEditableColumn style="text-align: right">
            <p-cellEditor>
              <ng-template pTemplate="input">
                <p-inputNumber
                  [(ngModel)]="asProjected(row.data).amount"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  (onFocus)="onProjectedEditStart(asProjected(row.data), 'amount', asProjected(row.data).amount)"
                  (onBlur)="onProjectedFieldEditIfChanged(asProjected(row.data), 'amount', asProjected(row.data).amount)"
                  (onKeyDown)="onProjectedAmountKeyDown($event, asProjected(row.data))">
                </p-inputNumber>
              </ng-template>
              <ng-template pTemplate="output">
                <span [class.negative]="asProjected(row.data).amount < 0" [class.positive]="asProjected(row.data).amount > 0">
                  {{ asProjected(row.data).amount | currencyFormat }}
                </span>
              </ng-template>
            </p-cellEditor>
          </td>
          <td></td>
          <td pEditableColumn>
            <p-cellEditor>
              <ng-template pTemplate="input">
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="asProjected(row.data).note"
                  (focus)="onProjectedEditStart(asProjected(row.data), 'note', asProjected(row.data).note)"
                  (blur)="onProjectedFieldEditIfChanged(asProjected(row.data), 'note', asProjected(row.data).note)"
                  (keydown.enter)="onProjectedFieldEditIfChanged(asProjected(row.data), 'note', asProjected(row.data).note)"
                  class="w-full" />
              </ng-template>
              <ng-template pTemplate="output">
                {{ asProjected(row.data).note }}
              </ng-template>
            </p-cellEditor>
          </td>
          <td></td>
          <td class="actions-cell">
            <button
              pButton
              type="button"
              [icon]="asProjected(row.data).is_struck_out ? 'pi pi-check-circle' : 'pi pi-ban'"
              class="p-button-text p-button-sm"
              [class.p-button-secondary]="!asProjected(row.data).is_struck_out"
              [class.p-button-success]="asProjected(row.data).is_struck_out"
              [pTooltip]="asProjected(row.data).is_struck_out ? 'Restore' : 'Strike out'"
              (click)="onToggleStrikeOut(asProjected(row.data))">
            </button>
            <button
              pButton
              type="button"
              icon="pi pi-link"
              class="p-button-text p-button-sm p-button-info"
              pTooltip="Merge with transaction"
              (click)="onMergeClick(asProjected(row.data))">
            </button>
            <button
              pButton
              type="button"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              pTooltip="Delete"
              (click)="onDeleteProjected(asProjected(row.data))">
            </button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="10" class="empty-message">No transactions in this period.</td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Merge Dialog -->
    <p-dialog
      header="Merge with Transaction"
      [(visible)]="mergeDialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }"
      [dismissableMask]="true">
      <div class="merge-list" *ngIf="mergeDialogVisible">
        <div
          *ngFor="let tx of transactions"
          class="merge-item"
          (click)="onMergeSelect(tx)">
          <span class="merge-date">{{ tx.date }}</span>
          <span class="merge-desc">{{ tx.description }}</span>
          <span class="merge-amount" [class.negative]="tx.amount < 0">
            {{ tx.amount | currencyFormat }}
          </span>
        </div>
        <div *ngIf="transactions.length === 0" class="merge-empty">
          No transactions available to merge with.
        </div>
      </div>
    </p-dialog>
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
    .projected-badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #ede9fe;
      border-radius: 4px;
      font-size: 12px;
      color: #6d28d9;
      font-weight: 500;
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

    /* Projected row styling */
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.projected-row > td {
      background-color: #f5f3ff;
    }
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.projected-row:hover > td {
      background-color: #ede9fe;
    }
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.struck-out > td {
      text-decoration: line-through;
      opacity: 0.6;
    }

    /* Actions cell */
    .actions-cell {
      white-space: nowrap;
      text-align: center;
    }
    .actions-cell button {
      padding: 0.15rem 0.3rem;
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

    /* Merge dialog */
    .merge-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
    .merge-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .merge-item:hover {
      background-color: #f3f4f6;
    }
    .merge-date {
      font-size: 13px;
      color: #6b7280;
      white-space: nowrap;
    }
    .merge-desc {
      flex: 1;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .merge-amount {
      font-weight: 600;
      white-space: nowrap;
    }
    .merge-empty {
      text-align: center;
      color: #9ca3af;
      padding: 20px;
    }
  `]
})
export class TransactionTableComponent implements OnInit, OnChanges {
  @Input() transactions: Transaction[] = [];
  @Input() projectedExpenses: ProjectedExpense[] = [];
  @Output() transactionUpdate = new EventEmitter<Transaction>();
  @Output() projectedExpenseUpdate = new EventEmitter<ProjectedExpense>();
  @Output() projectedExpenseDelete = new EventEmitter<ProjectedExpense>();
  @Output() projectedExpenseMerge = new EventEmitter<{ projected: ProjectedExpense; transactionId: number }>();

  displayRows: DisplayRow[] = [];

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
  private projectedCategoryBlurTimeout: ReturnType<typeof setTimeout> | null = null;

  // Merge dialog
  mergeDialogVisible = false;
  private mergeTarget: ProjectedExpense | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.buildDisplayRows();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] || changes['projectedExpenses']) {
      this.buildDisplayRows();
    }
  }

  buildDisplayRows(): void {
    const txRows: DisplayRow[] = this.transactions.map(tx => ({
      type: 'transaction' as const,
      date: tx.date,
      data: tx
    }));
    const peRows: DisplayRow[] = this.projectedExpenses.map(pe => ({
      type: 'projected' as const,
      date: pe.date,
      data: pe
    }));
    this.displayRows = [...txRows, ...peRows].sort(
      (a, b) => b.date.localeCompare(a.date)
    );
  }

  // Type-safe accessors for template
  asTransaction(data: Transaction | ProjectedExpense): Transaction {
    return data as Transaction;
  }

  asProjected(data: Transaction | ProjectedExpense): ProjectedExpense {
    return data as ProjectedExpense;
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

  // ========== Transaction editing ==========

  onCategoryEnter(transaction: Transaction): void {
    if (this.categoryBlurTimeout) {
      clearTimeout(this.categoryBlurTimeout);
      this.categoryBlurTimeout = null;
    }
    this.onFieldEditIfChanged(transaction, 'connelaide_category', transaction.connelaide_category);
  }

  onCategoryBlur(transaction: Transaction): void {
    this.categoryBlurTimeout = setTimeout(() => {
      this.categoryBlurTimeout = null;
      this.onFieldEditIfChanged(transaction, 'connelaide_category', transaction.connelaide_category);
    }, 200);
  }

  onEditStart(transaction: Transaction, field: string, value: unknown): void {
    const key = `tx:${transaction.id}:${field}`;
    if (!this.originalValues.has(key)) {
      this.originalValues.set(key, value);
    }
  }

  onFieldEditIfChanged(transaction: Transaction, field: string, currentValue: unknown): void {
    const key = `tx:${transaction.id}:${field}`;

    if (!this.originalValues.has(key)) {
      if (field === 'connelaide_category' && typeof currentValue === 'string' && currentValue.trim()) {
        const existingCategory = this.categories.find(c => c.name === currentValue);
        if (existingCategory) {
          transaction.connelaide_category_id = existingCategory.id;
          transaction.connelaide_category = existingCategory.name;
          this.transactionUpdate.emit(transaction);
        }
      }
      return;
    }

    const originalValue = this.originalValues.get(key);
    this.originalValues.delete(key);

    if (currentValue === originalValue) {
      return;
    }

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
                (transaction as unknown as Record<string, unknown>)[field] = originalValue;
              }
            });
          },
          reject: () => {
            (transaction as unknown as Record<string, unknown>)[field] = originalValue;
          }
        });
        return;
      }

      transaction.connelaide_category_id = existingCategory.id;
      transaction.connelaide_category = existingCategory.name;
    }

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
    transaction.edited_amount = newValue === transaction.amount ? null : newValue;
  }

  // ========== Projected expense editing ==========

  onProjectedEditStart(expense: ProjectedExpense, field: string, value: unknown): void {
    const key = `pe:${expense.id}:${field}`;
    if (!this.originalValues.has(key)) {
      this.originalValues.set(key, value);
    }
  }

  onProjectedFieldEditIfChanged(expense: ProjectedExpense, field: string, currentValue: unknown): void {
    const key = `pe:${expense.id}:${field}`;

    if (!this.originalValues.has(key)) {
      if (field === 'connelaide_category' && typeof currentValue === 'string' && currentValue.trim()) {
        const existingCategory = this.categories.find(c => c.name === currentValue);
        if (existingCategory) {
          expense.connelaide_category_id = existingCategory.id;
          expense.connelaide_category = existingCategory.name;
          this.projectedExpenseUpdate.emit(expense);
        }
      }
      return;
    }

    const originalValue = this.originalValues.get(key);
    this.originalValues.delete(key);

    if (currentValue === originalValue) {
      return;
    }

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
                expense.connelaide_category_id = newCategory.id;
                expense.connelaide_category = newCategory.name;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Category Created',
                  detail: `Category "${newCategory.name}" has been created.`
                });
                this.projectedExpenseUpdate.emit(expense);
              },
              error: (error) => {
                console.error('Error creating category:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create category.'
                });
                (expense as unknown as Record<string, unknown>)[field] = originalValue;
              }
            });
          },
          reject: () => {
            (expense as unknown as Record<string, unknown>)[field] = originalValue;
          }
        });
        return;
      }

      expense.connelaide_category_id = existingCategory.id;
      expense.connelaide_category = existingCategory.name;
    }

    this.projectedExpenseUpdate.emit(expense);
  }

  onProjectedCategoryEnter(expense: ProjectedExpense): void {
    if (this.projectedCategoryBlurTimeout) {
      clearTimeout(this.projectedCategoryBlurTimeout);
      this.projectedCategoryBlurTimeout = null;
    }
    this.onProjectedFieldEditIfChanged(expense, 'connelaide_category', expense.connelaide_category);
  }

  onProjectedCategoryBlur(expense: ProjectedExpense): void {
    this.projectedCategoryBlurTimeout = setTimeout(() => {
      this.projectedCategoryBlurTimeout = null;
      this.onProjectedFieldEditIfChanged(expense, 'connelaide_category', expense.connelaide_category);
    }, 200);
  }

  onProjectedAmountKeyDown(event: KeyboardEvent, expense: ProjectedExpense) {
    if (event.key === 'Enter') {
      this.onProjectedFieldEditIfChanged(expense, 'amount', expense.amount);
    }
  }

  // ========== Projected expense actions ==========

  onToggleStrikeOut(expense: ProjectedExpense): void {
    expense.is_struck_out = !expense.is_struck_out;
    this.projectedExpenseUpdate.emit(expense);
  }

  onMergeClick(expense: ProjectedExpense): void {
    this.mergeTarget = expense;
    this.mergeDialogVisible = true;
  }

  onMergeSelect(transaction: Transaction): void {
    if (this.mergeTarget) {
      this.projectedExpenseMerge.emit({
        projected: this.mergeTarget,
        transactionId: Number(transaction.id)
      });
      this.mergeDialogVisible = false;
      this.mergeTarget = null;
    }
  }

  onDeleteProjected(expense: ProjectedExpense): void {
    this.confirmationService.confirm({
      message: `Delete projected expense "${expense.name}"?`,
      header: 'Delete Projected Expense',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.projectedExpenseDelete.emit(expense);
      }
    });
  }
}
