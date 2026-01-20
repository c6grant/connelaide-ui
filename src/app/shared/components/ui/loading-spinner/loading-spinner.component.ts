import { Component, Input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="spinner-container">
      <p-progressSpinner [strokeWidth]="strokeWidth" [style]="{width: size, height: size}"></p-progressSpinner>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size = '50px';
  @Input() strokeWidth = '4';
}
