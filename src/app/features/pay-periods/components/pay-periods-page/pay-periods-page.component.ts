import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PayPeriod, PayPeriodCreate } from '../../../../shared/models/pay-period.model';
import { PayPeriodsService } from '../../services/pay-periods.service';

@Component({
  selector: 'app-pay-periods-page',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="pay-periods-container">
      <div class="header">
        <h1>Pay Periods</h1>
        <p class="subtitle">Manage your pay periods with custom date ranges and budgets</p>
      </div>

      <div class="add-period-section">
        <h3>Add New Pay Period</h3>
        <div class="add-period-form">
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
            <label for="endDate">End Date</label>
            <p-calendar
              id="endDate"
              [(ngModel)]="newEndDate"
              dateFormat="yy-mm-dd"
              [showIcon]="true"
              placeholder="YYYY-MM-DD">
            </p-calendar>
          </div>
          <div class="form-field">
            <label for="budget">Checking Budget</label>
            <p-inputNumber
              id="budget"
              [(ngModel)]="newCheckingBudget"
              mode="currency"
              currency="USD"
              locale="en-US"
              placeholder="Optional">
            </p-inputNumber>
          </div>
          <div class="form-field form-actions">
            <p-button
              label="Add Pay Period"
              icon="pi pi-plus"
              (onClick)="addPayPeriod()"
              [disabled]="!newStartDate || !newEndDate">
            </p-button>
          </div>
        </div>
      </div>

      <div class="table-container" *ngIf="payPeriods.length > 0">
        <p-table
          [value]="payPeriods"
          [paginator]="payPeriods.length > 20"
          [rows]="20"
          [rowHover]="true"
          dataKey="id"
          editMode="cell"
          styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 180px">Start Date</th>
              <th style="width: 180px">End Date</th>
              <th style="width: 160px">Checking Budget</th>
              <th style="width: 100px; text-align: center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-period>
            <tr>
              <td pEditableColumn>
                <p-cellEditor>
                  <ng-template pTemplate="input">
                    <p-calendar
                      [(ngModel)]="editStartDate"
                      dateFormat="yy-mm-dd"
                      [showIcon]="true"
                      (onShow)="onStartDateEditInit(period)"
                      (onClose)="onStartDateBlur(period)"
                      appendTo="body">
                    </p-calendar>
                  </ng-template>
                  <ng-template pTemplate="output">
                    {{ period.start_date }}
                  </ng-template>
                </p-cellEditor>
              </td>
              <td pEditableColumn>
                <p-cellEditor>
                  <ng-template pTemplate="input">
                    <p-calendar
                      [(ngModel)]="editEndDate"
                      dateFormat="yy-mm-dd"
                      [showIcon]="true"
                      (onShow)="onEndDateEditInit(period)"
                      (onClose)="onEndDateBlur(period)"
                      appendTo="body">
                    </p-calendar>
                  </ng-template>
                  <ng-template pTemplate="output">
                    {{ period.end_date }}
                  </ng-template>
                </p-cellEditor>
              </td>
              <td pEditableColumn>
                <p-cellEditor>
                  <ng-template pTemplate="input">
                    <p-inputNumber
                      [(ngModel)]="period.checking_budget"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      (onBlur)="onBudgetBlur(period)"
                      (keydown.enter)="onBudgetBlur(period)">
                    </p-inputNumber>
                  </ng-template>
                  <ng-template pTemplate="output">
                    {{ period.checking_budget !== null ? (period.checking_budget | currency:'USD') : '-' }}
                  </ng-template>
                </p-cellEditor>
              </td>
              <td style="text-align: center">
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="confirmDelete(period)">
                </p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty-message">No pay periods found. Add one above!</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <div class="empty-state" *ngIf="payPeriods.length === 0 && !loading">
        <div class="empty-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <h3>No pay periods yet</h3>
        <p>Add your first pay period using the form above.</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Loading pay periods...</span>
      </div>
    </div>
  `,
  styles: [`
    .pay-periods-container {
      max-width: 900px;
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
    .add-period-section {
      background: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .add-period-section h3 {
      margin: 0 0 16px 0;
      color: #374151;
      font-size: 16px;
    }
    .add-period-form {
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
    :host ::ng-deep .p-datatable .p-editable-column {
      cursor: pointer;
    }
    :host ::ng-deep .p-datatable .p-editable-column:hover {
      background-color: #f3f4f6;
    }
    :host ::ng-deep .p-inputnumber,
    :host ::ng-deep .p-calendar {
      width: 100%;
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
  `]
})
export class PayPeriodsPageComponent implements OnInit {
  payPeriods: PayPeriod[] = [];
  newStartDate: Date | null = null;
  newEndDate: Date | null = null;
  newCheckingBudget: number | null = null;
  loading = false;

  // Edit state for inline editing
  editStartDate: Date | null = null;
  editEndDate: Date | null = null;

  // Track original values for edit detection
  private originalValues = new Map<number, { start_date: string; end_date: string; checking_budget: number | null }>();

  constructor(
    private payPeriodsService: PayPeriodsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPayPeriods();
  }

  loadPayPeriods(): void {
    this.loading = true;
    this.payPeriodsService.getPayPeriods().subscribe({
      next: (payPeriods) => {
        this.payPeriods = payPeriods;
        // Store original values for edit detection
        payPeriods.forEach(p => this.originalValues.set(p.id, {
          start_date: p.start_date,
          end_date: p.end_date,
          checking_budget: p.checking_budget
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pay periods:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load pay periods'
        });
        this.loading = false;
      }
    });
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

  addPayPeriod(): void {
    if (!this.newStartDate || !this.newEndDate) return;

    const data: PayPeriodCreate = {
      start_date: this.formatDateForApi(this.newStartDate),
      end_date: this.formatDateForApi(this.newEndDate),
      checking_budget: this.newCheckingBudget
    };

    this.payPeriodsService.createPayPeriod(data).subscribe({
      next: (payPeriod) => {
        // Insert at correct position (sorted by start_date desc)
        const insertIndex = this.payPeriods.findIndex(p => p.start_date < payPeriod.start_date);
        if (insertIndex === -1) {
          this.payPeriods.push(payPeriod);
        } else {
          this.payPeriods.splice(insertIndex, 0, payPeriod);
        }
        this.originalValues.set(payPeriod.id, {
          start_date: payPeriod.start_date,
          end_date: payPeriod.end_date,
          checking_budget: payPeriod.checking_budget
        });
        this.newStartDate = null;
        this.newEndDate = null;
        this.newCheckingBudget = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Pay period created (${payPeriod.start_date} to ${payPeriod.end_date})`
        });
      },
      error: (error) => {
        console.error('Error creating pay period:', error);
        const detail = error.error?.detail || 'Failed to create pay period';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail
        });
      }
    });
  }

  onStartDateEditInit(period: PayPeriod): void {
    this.editStartDate = this.parseDateString(period.start_date);
  }

  onEndDateEditInit(period: PayPeriod): void {
    this.editEndDate = this.parseDateString(period.end_date);
  }

  onStartDateBlur(period: PayPeriod): void {
    if (!this.editStartDate) return;

    const newStartDate = this.formatDateForApi(this.editStartDate);
    const original = this.originalValues.get(period.id);

    if (newStartDate !== original?.start_date) {
      this.payPeriodsService.updatePayPeriod(period.id, { start_date: newStartDate }).subscribe({
        next: (updated) => {
          period.start_date = updated.start_date;
          this.originalValues.set(period.id, {
            start_date: updated.start_date,
            end_date: updated.end_date,
            checking_budget: updated.checking_budget
          });
          // Re-sort the array
          this.payPeriods.sort((a, b) => b.start_date.localeCompare(a.start_date));
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Start date updated'
          });
        },
        error: (error) => {
          console.error('Error updating start date:', error);
          period.start_date = original?.start_date || period.start_date;
          const detail = error.error?.detail || 'Failed to update start date';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
        }
      });
    }
  }

  onEndDateBlur(period: PayPeriod): void {
    if (!this.editEndDate) return;

    const newEndDate = this.formatDateForApi(this.editEndDate);
    const original = this.originalValues.get(period.id);

    if (newEndDate !== original?.end_date) {
      this.payPeriodsService.updatePayPeriod(period.id, { end_date: newEndDate }).subscribe({
        next: (updated) => {
          period.end_date = updated.end_date;
          this.originalValues.set(period.id, {
            start_date: updated.start_date,
            end_date: updated.end_date,
            checking_budget: updated.checking_budget
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'End date updated'
          });
        },
        error: (error) => {
          console.error('Error updating end date:', error);
          period.end_date = original?.end_date || period.end_date;
          const detail = error.error?.detail || 'Failed to update end date';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
        }
      });
    }
  }

  onBudgetBlur(period: PayPeriod): void {
    const original = this.originalValues.get(period.id);

    if (period.checking_budget !== original?.checking_budget) {
      this.payPeriodsService.updatePayPeriod(period.id, { checking_budget: period.checking_budget }).subscribe({
        next: (updated) => {
          this.originalValues.set(period.id, {
            start_date: updated.start_date,
            end_date: updated.end_date,
            checking_budget: updated.checking_budget
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Budget updated'
          });
        },
        error: (error) => {
          console.error('Error updating budget:', error);
          period.checking_budget = original?.checking_budget ?? null;
          const detail = error.error?.detail || 'Failed to update budget';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
        }
      });
    }
  }

  confirmDelete(period: PayPeriod): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the pay period from ${period.start_date} to ${period.end_date}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deletePayPeriod(period)
    });
  }

  deletePayPeriod(period: PayPeriod): void {
    this.payPeriodsService.deletePayPeriod(period.id).subscribe({
      next: () => {
        this.payPeriods = this.payPeriods.filter(p => p.id !== period.id);
        this.originalValues.delete(period.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Pay period deleted`
        });
      },
      error: (error) => {
        console.error('Error deleting pay period:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete pay period'
        });
      }
    });
  }
}
