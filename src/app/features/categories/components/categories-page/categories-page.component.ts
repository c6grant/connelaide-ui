import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConnalaideCategory } from '../../../../shared/models/category.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="categories-container">
      <div class="header">
        <h1>Categories</h1>
        <p class="subtitle">Manage your Connelaide categories</p>
      </div>

      <div class="add-category-section">
        <div class="add-category-form">
          <input
            pInputText
            type="text"
            [(ngModel)]="newCategoryName"
            placeholder="Enter category name"
            (keydown.enter)="addCategory()"
            class="category-input" />
          <p-button
            label="Add Category"
            icon="pi pi-plus"
            (onClick)="addCategory()"
            [disabled]="!newCategoryName.trim()">
          </p-button>
        </div>
      </div>

      <div class="table-container" *ngIf="categories.length > 0">
        <p-table
          [value]="categories"
          [paginator]="categories.length > 20"
          [rows]="20"
          [rowHover]="true"
          dataKey="id"
          editMode="cell"
          styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th style="width: 100px; text-align: center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-category>
            <tr>
              <td pEditableColumn>
                <p-cellEditor>
                  <ng-template pTemplate="input">
                    <input
                      pInputText
                      type="text"
                      [(ngModel)]="category.name"
                      (blur)="onCategoryNameBlur(category)"
                      (keydown.enter)="onCategoryNameBlur(category)"
                      class="w-full" />
                  </ng-template>
                  <ng-template pTemplate="output">
                    {{ category.name }}
                  </ng-template>
                </p-cellEditor>
              </td>
              <td style="text-align: center">
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="confirmDelete(category)">
                </p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="2" class="empty-message">No categories found. Add one above!</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <div class="empty-state" *ngIf="categories.length === 0 && !loading">
        <div class="empty-icon">
          <i class="pi pi-folder-open"></i>
        </div>
        <h3>No categories yet</h3>
        <p>Add your first category using the form above.</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Loading categories...</span>
      </div>
    </div>
  `,
  styles: [`
    .categories-container {
      max-width: 800px;
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
    .add-category-section {
      background: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .add-category-form {
      display: flex;
      gap: 12px;
    }
    .category-input {
      flex: 1;
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
  `]
})
export class CategoriesPageComponent implements OnInit {
  categories: ConnalaideCategory[] = [];
  newCategoryName = '';
  loading = false;

  // Track original values for edit detection
  private originalNames = new Map<number, string>();

  constructor(
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Store original names for edit detection
        categories.forEach(c => this.originalNames.set(c.id, c.name));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories'
        });
        this.loading = false;
      }
    });
  }

  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.categoriesService.createCategory({ name }).subscribe({
      next: (category) => {
        this.categories.push(category);
        this.originalNames.set(category.id, category.name);
        this.newCategoryName = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Category "${category.name}" created`
        });
      },
      error: (error) => {
        console.error('Error creating category:', error);
        const detail = error.error?.detail || 'Failed to create category';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail
        });
      }
    });
  }

  onCategoryNameBlur(category: ConnalaideCategory): void {
    const originalName = this.originalNames.get(category.id);
    const newName = category.name.trim();

    // Only update if name changed
    if (newName && newName !== originalName) {
      this.categoriesService.updateCategory(category.id, { name: newName }).subscribe({
        next: (updated) => {
          this.originalNames.set(category.id, updated.name);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Category updated to "${updated.name}"`
          });
        },
        error: (error) => {
          console.error('Error updating category:', error);
          // Revert to original name on error
          category.name = originalName || '';
          const detail = error.error?.detail || 'Failed to update category';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail
          });
        }
      });
    } else if (!newName) {
      // Revert if name is empty
      category.name = originalName || '';
    }
  }

  confirmDelete(category: ConnalaideCategory): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteCategory(category)
    });
  }

  deleteCategory(category: ConnalaideCategory): void {
    this.categoriesService.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== category.id);
        this.originalNames.delete(category.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Category "${category.name}" deleted`
        });
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete category'
        });
      }
    });
  }
}
