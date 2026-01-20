import { Component, Input } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-aggregate-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="chart-container">
      <h3>{{ title }}</h3>
      <p-chart [type]="type" [data]="data" [options]="options"></p-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  `]
})
export class AggregateChartComponent {
  @Input() title = 'Chart';
  @Input() type: 'bar' | 'line' | 'pie' | 'doughnut' = 'bar';
  @Input() data: any;
  @Input() options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
}
