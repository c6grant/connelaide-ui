import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [],
  template: `
    <div class="container">
      Hello Studaliaders! We are thinking of going to dinner after my Stout call
      that starts at 5:15 and likely goes to 5:30ish. Does that work for you??
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
