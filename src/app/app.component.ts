import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [],
  template: `
    <div class="container">
      Welcome hehe. 
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
export class AppComponent {}
