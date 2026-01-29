import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RecurringExpense, RecurringExpenseCreate, RecurringExpenseUpdate } from '../../../../shared/models/recurring-expense.model';
import { RecurringExpensesService } from '../../services/recurring-expenses.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { ConnalaideCategory } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-recurring-expenses-page',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CurrencyPipe,
    TitleCasePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    AutoCompleteModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="recurring-expenses-container">
      <div class="header">
        <h1>Recurring Expenses</h1>
        <p class="subtitle">Manage recurring expense patterns that auto-generate projected expenses</p>
      </div>

      <div class="add-section">
        <h3>Add Recurring Expense</h3>
        <div class="add-form">
          <div class="form-row">
            <div class="form-field">
              <label for="name">Name</label>
              <input pInputText id="name" [(ngModel)]="newName" placeholder="e.g. Rent" />
            </div>
            <div class="form-field">
              <label for="amount">Amount</label>
              <p-inputNumber
                id="amount"
                [(ngModel)]="newAmount"
                mode="currency"
                currency="USD"
                locale="en-US"
                placeholder="0.00">
              </p-inputNumber>
            </div>
            <div class="form-field">
              <label for="frequency">Frequency</label>
              <p-dropdown
                id="frequency"
                [(ngModel)]="newFrequency"
                [options]="frequencyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select"
                styleClass="w-full">
              </p-dropdown>
            </div>
            <div class="form-field">
              <label for="dayOfMonth">Day of Month</label>
              <p-inputNumber
                id="dayOfMonth"
                [(ngModel)]="newDayOfMonth"
                [min]="1"
                [max]="31"
                placeholder="1-31">
              </p-inputNumber>
            </div>
            <div class="form-field" *ngIf="newFrequency === 'yearly'">
              <label for="monthOfYear">Month</label>
              <p-dropdown
                id="monthOfYear"
                [(ngModel)]="newMonthOfYear"
                [options]="monthOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select"
                styleClass="w-full">
              </p-dropdown>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="startDate">Start Date</label>
              <p-calendar
                id="startDate"
                [(ngModel)]="newStartDate"
                dateFormat="yy-mm-dd"
                [showIcon]="true"
                placeholder="YYYY-MM-DD">
              </p-calendar>
            </div>
            <div class="form-field">
              <label for="endDate">End Date (optional)</label>
              <p-calendar
                id="endDate"
                [(ngModel)]="newEndDate"
                dateFormat="yy-mm-dd"
                [showIcon]="true"
                placeholder="YYYY-MM-DD">
              </p-calendar>
            </div>
            <div class="form-field">
              <label for="category">Category</label>
              <p-autoComplete
                id="category"
                [(ngModel)]="newCategory"
                [suggestions]="filteredCategories"
                (completeMethod)="filterCategories($event)"
                [dropdown]="true"
                [forceSelection]="false"
                placeholder="Select category"
                styleClass="w-full">
              </p-autoComplete>
            </div>
            <div class="form-field">
              <label for="note">Note</label>
              <input pInputText id="note" [(ngModel)]="newNote" placeholder="Optional note" />
            </div>
            <div class="form-field form-actions">
              <p-button
                label="Add"
                icon="pi pi-plus"
                (onClick)="addRecurringExpense()"
                [disabled]="!newName || !newAmount || !newFrequency || !newDayOfMonth || !newStartDate">
              </p-button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container" *ngIf="expenses.length > 0">
        <p-table
          [value]="expenses"
          [paginator]="expenses.length > 20"
          [rows]="20"
          [rowHover]="true"
          dataKey="id"
          styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th style="text-align: right">Amount</th>
              <th>Frequency</th>
              <th>Day</th>
              <th>Category</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th style="width: 140px; text-align: center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-expense>
            <tr>
              <td>{{ expense.name }}</td>
              <td style="text-align: right">{{ expense.amount | currency:'USD' }}</td>
              <td>{{ expense.frequency | titlecase }}</td>
              <td>
                {{ expense.day_of_month }}
                <span *ngIf="expense.frequency === 'yearly' && expense.month_of_year">
                  / {{ monthNames[expense.month_of_year - 1] }}
                </span>
              </td>
              <td>
                <span class="category-badge" *ngIf="expense.connelaide_category">{{ expense.connelaide_category }}</span>
              </td>
              <td>{{ expense.start_date }}</td>
              <td>{{ expense.end_date || '-' }}</td>
              <td>
                <p-tag
                  [value]="expense.is_active ? 'Active' : 'Paused'"
                  [severity]="expense.is_active ? 'success' : 'warning'">
                </p-tag>
              </td>
              <td class="actions-cell">
                <button
                  pButton
                  type="button"
                  [icon]="expense.is_active ? 'pi pi-pause' : 'pi pi-play'"
                  class="p-button-text p-button-sm"
                  [pTooltip]="expense.is_active ? 'Pause' : 'Resume'"
                  (click)="toggleActive(expense)">
                </button>
                <button
                  pButton
                  type="button"
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm p-button-info"
                  pTooltip="Edit"
                  (click)="openEditDialog(expense)">
                </button>
                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  pTooltip="Delete"
                  (click)="confirmDelete(expense)">
                </button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="empty-message">No recurring expenses found.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <div class="empty-state" *ngIf="expenses.length === 0 && !loading">
        <div class="empty-icon">
          <i class="pi pi-replay"></i>
        </div>
        <h3>No recurring expenses yet</h3>
        <p>Add your first recurring expense using the form above.</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Loading recurring expenses...</span>
      </div>
    </div>

    <!-- Edit Dialog -->
    <p-dialog
      header="Edit Recurring Expense"
      [(visible)]="editDialogVisible"
      [modal]="true"
      [style]="{ width: '500px' }"
      [dismissableMask]="true">
      <div class="edit-form" *ngIf="editDialogVisible && editExpense">
        <div class="form-field">
          <label>Name</label>
          <input pInputText [(ngModel)]="editExpense.name" class="w-full" />
        </div>
        <div class="form-field">
          <label>Amount</label>
          <p-inputNumber
            [(ngModel)]="editExpense.amount"
            mode="currency"
            currency="USD"
            locale="en-US">
          </p-inputNumber>
        </div>
        <div class="form-field">
          <label>Frequency</label>
          <p-dropdown
            [(ngModel)]="editExpense.frequency"
            [options]="frequencyOptions"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full">
          </p-dropdown>
        </div>
        <div class="form-field">
          <label>Day of Month</label>
          <p-inputNumber
            [(ngModel)]="editExpense.day_of_month"
            [min]="1"
            [max]="31">
          </p-inputNumber>
        </div>
        <div class="form-field" *ngIf="editExpense.frequency === 'yearly'">
          <label>Month</label>
          <p-dropdown
            [(ngModel)]="editExpense.month_of_year"
            [options]="monthOptions"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full">
          </p-dropdown>
        </div>
        <div class="form-field">
          <label>Start Date</label>
          <p-calendar
            [(ngModel)]="editStartDate"
            dateFormat="yy-mm-dd"
            [showIcon]="true">
          </p-calendar>
        </div>
        <div class="form-field">
          <label>End Date (optional)</label>
          <p-calendar
            [(ngModel)]="editEndDate"
            dateFormat="yy-mm-dd"
            [showIcon]="true">
          </p-calendar>
        </div>
        <div class="form-field">
          <label>Category</label>
          <p-autoComplete
            [(ngModel)]="editCategory"
            [suggestions]="filteredCategories"
            (completeMethod)="filterCategories($event)"
            [dropdown]="true"
            [forceSelection]="false"
            styleClass="w-full">
          </p-autoComplete>
        </div>
        <div class="form-field">
          <label>Note</label>
          <input pInputText [(ngModel)]="editExpense.note" class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" [text]="true" (onClick)="editDialogVisible = false"></p-button>
        <p-button label="Save" icon="pi pi-check" (onClick)="saveEdit()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .recurring-expenses-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px;
    }
    .header {
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      color: #1f2937;
    }
    .subtitle {
      margin: 0;
      color: #6b7280;
    }
    .add-section {
      background: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .add-section h3 {
      margin: 0 0 16px 0;
      color: #374151;
      font-size: 16px;
    }
    .add-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-end;
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
    .form-actions {
      padding-top: 22px;
    }
    .table-container {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background-color: #f9fafb;
      color: #6b7280;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
    }
    .category-badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      font-size: 12px;
      color: #4b5563;
    }
    .actions-cell {
      white-space: nowrap;
      text-align: center;
    }
    .actions-cell button {
      padding: 0.15rem 0.3rem;
    }
    .empty-message {
      text-align: center;
      color: #9ca3af;
      padding: 20px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .empty-icon {
      font-size: 48px;
      color: #d1d5db;
      margin-bottom: 16px;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #1f2937;
    }
    .empty-state p {
      margin: 0;
      color: #6b7280;
    }
    .loading-state {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }
    .loading-state i {
      margin-right: 8px;
    }
    .w-full {
      width: 100%;
    }
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .edit-form .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .edit-form .form-field label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    :host ::ng-deep .edit-form .p-inputnumber,
    :host ::ng-deep .edit-form .p-calendar,
    :host ::ng-deep .edit-form .p-dropdown,
    :host ::ng-deep .edit-form .p-autocomplete {
      width: 100%;
    }
  `]
})
export class RecurringExpensesPageComponent implements OnInit {
  expenses: RecurringExpense[] = [];
  loading = false;

  // New expense form
  newName = '';
  newAmount: number | null = null;
  newFrequency: string | null = null;
  newDayOfMonth: number | null = null;
  newMonthOfYear: number | null = null;
  newStartDate: Date | null = null;
  newEndDate: Date | null = null;
  newCategory: string | null = null;
  newNote = '';

  // Edit dialog
  editDialogVisible = false;
  editExpense: RecurringExpense | null = null;
  editStartDate: Date | null = null;
  editEndDate: Date | null = null;
  editCategory: string | null = null;
  private editExpenseId: number | null = null;

  // Category autocomplete
  categories: ConnalaideCategory[] = [];
  filteredCategories: string[] = [];

  frequencyOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private recurringExpensesService: RecurringExpensesService,
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadCategories();
  }

  loadExpenses(): void {
    this.loading = true;
    this.recurringExpensesService.getRecurringExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recurring expenses:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load recurring expenses'
        });
        this.loading = false;
      }
    });
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

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  parseDateString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private resolveCategoryId(categoryName: string | null): number | undefined {
    if (!categoryName) return undefined;
    const found = this.categories.find(c => c.name === categoryName);
    return found?.id;
  }

  addRecurringExpense(): void {
    if (!this.newName || !this.newAmount || !this.newFrequency || !this.newDayOfMonth || !this.newStartDate) return;

    const data: RecurringExpenseCreate = {
      name: this.newName,
      amount: this.newAmount,
      frequency: this.newFrequency as 'monthly' | 'yearly',
      day_of_month: this.newDayOfMonth,
      start_date: this.formatDateForApi(this.newStartDate),
      ...(this.newFrequency === 'yearly' && this.newMonthOfYear ? { month_of_year: this.newMonthOfYear } : {}),
      ...(this.newEndDate ? { end_date: this.formatDateForApi(this.newEndDate) } : {}),
      ...(this.newCategory ? { connelaide_category_id: this.resolveCategoryId(this.newCategory) } : {}),
      ...(this.newNote ? { note: this.newNote } : {})
    };

    this.recurringExpensesService.createRecurringExpense(data).subscribe({
      next: (expense) => {
        this.expenses.push(expense);
        this.expenses.sort((a, b) => a.name.localeCompare(b.name));
        this.resetForm();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Recurring expense "${expense.name}" created`
        });
      },
      error: (error) => {
        console.error('Error creating recurring expense:', error);
        const detail = error.error?.detail || 'Failed to create recurring expense';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail
        });
      }
    });
  }

  private resetForm(): void {
    this.newName = '';
    this.newAmount = null;
    this.newFrequency = null;
    this.newDayOfMonth = null;
    this.newMonthOfYear = null;
    this.newStartDate = null;
    this.newEndDate = null;
    this.newCategory = null;
    this.newNote = '';
  }

  toggleActive(expense: RecurringExpense): void {
    this.recurringExpensesService.updateRecurringExpense(expense.id, {
      is_active: !expense.is_active
    }).subscribe({
      next: (updated) => {
        Object.assign(expense, updated);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${expense.name} ${expense.is_active ? 'resumed' : 'paused'}`
        });
      },
      error: (error) => {
        console.error('Error toggling active state:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update recurring expense'
        });
      }
    });
  }

  openEditDialog(expense: RecurringExpense): void {
    this.editExpenseId = expense.id;
    this.editExpense = { ...expense };
    this.editStartDate = this.parseDateString(expense.start_date);
    this.editEndDate = expense.end_date ? this.parseDateString(expense.end_date) : null;
    this.editCategory = expense.connelaide_category || null;
    this.editDialogVisible = true;
  }

  saveEdit(): void {
    if (!this.editExpense || !this.editExpenseId) return;

    const update: RecurringExpenseUpdate = {
      name: this.editExpense.name,
      amount: this.editExpense.amount,
      frequency: this.editExpense.frequency,
      day_of_month: this.editExpense.day_of_month,
      month_of_year: this.editExpense.frequency === 'yearly' ? this.editExpense.month_of_year : null,
      start_date: this.editStartDate ? this.formatDateForApi(this.editStartDate) : this.editExpense.start_date,
      end_date: this.editEndDate ? this.formatDateForApi(this.editEndDate) : null,
      connelaide_category_id: this.resolveCategoryId(this.editCategory) ?? null,
      note: this.editExpense.note
    };

    this.recurringExpensesService.updateRecurringExpense(this.editExpenseId, update).subscribe({
      next: (updated) => {
        const index = this.expenses.findIndex(e => e.id === this.editExpenseId);
        if (index !== -1) {
          this.expenses[index] = updated;
        }
        this.editDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `"${updated.name}" updated. Future generated instances will reflect the changes.`
        });
      },
      error: (error) => {
        console.error('Error updating recurring expense:', error);
        const detail = error.error?.detail || 'Failed to update recurring expense';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail
        });
      }
    });
  }

  confirmDelete(expense: RecurringExpense): void {
    this.confirmationService.confirm({
      message: `Delete "${expense.name}"? Future untouched projected expenses will also be removed.`,
      header: 'Delete Recurring Expense',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteExpense(expense)
    });
  }

  deleteExpense(expense: RecurringExpense): void {
    this.recurringExpensesService.deleteRecurringExpense(expense.id, true).subscribe({
      next: () => {
        this.expenses = this.expenses.filter(e => e.id !== expense.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `"${expense.name}" deleted`
        });
      },
      error: (error) => {
        console.error('Error deleting recurring expense:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete recurring expense'
        });
      }
    });
  }
}
