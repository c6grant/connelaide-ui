import { Component, OnInit } from "@angular/core";


@Component({
  selector: "app-root",
  standalone: true,
  imports: [],
  template: `
    <div class="container">
      <div *ngIf="message; else loading">
        API says: {{ message }}
      </div>
      <ng-template #loading>
        Loading message from API...
      </ng-template>
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        font-size: 2rem;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  message: string | null = null;

  ngOnInit() {
    fetch('/api/v1/example')
      .then(res => res.json())
      .then(data => {
        this.message = data.message;
      })
      .catch(() => {
        this.message = 'Failed to load message from API.';
      });
  }
}
