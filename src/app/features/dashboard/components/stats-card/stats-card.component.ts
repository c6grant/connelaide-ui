import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { CardModule } from 'primeng/card';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [NgIf, CardModule, CurrencyFormatPipe],
  template: `
    <p-card [styleClass]="'stats-card ' + colorClass">
      <div class="stats-content">
        <div class="stats-icon">
          <i [class]="icon"></i>
        </div>
        <div class="stats-info">
          <span class="stats-label">{{ label }}</span>
          <span class="stats-value" *ngIf="isCurrency">{{ value | currencyFormat }}</span>
          <span class="stats-value" *ngIf="!isCurrency">{{ value }}</span>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background-color: #f3f4f6;
      color: #6b7280;
    }
    .stats-info {
      display: flex;
      flex-direction: column;
    }
    .stats-label {
      font-size: 14px;
      color: #6b7280;
    }
    .stats-value {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    :host ::ng-deep .stats-card.green .stats-icon {
      background-color: #d1fae5;
      color: #059669;
    }
    :host ::ng-deep .stats-card.red .stats-icon {
      background-color: #fee2e2;
      color: #dc2626;
    }
    :host ::ng-deep .stats-card.blue .stats-icon {
      background-color: #dbeafe;
      color: #2563eb;
    }
  `]
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() icon = 'pi pi-chart-line';
  @Input() colorClass = '';
  @Input() isCurrency = true;
}
