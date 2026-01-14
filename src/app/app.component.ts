import { Component, OnInit } from "@angular/core";
import { NgIf, AsyncPipe, JsonPipe } from "@angular/common";
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { AuthService } from './auth.service';


@Component({
  selector: "app-root",
  standalone: true,
  imports: [NgIf, AsyncPipe, JsonPipe],
  template: `
    <div class="container">
      <div class="header">
        <h1>Connelaide</h1>
        <div class="auth-buttons">
          <ng-container *ngIf="auth.isAuthenticated$ | async; else loggedOut">
            <button (click)="callProtectedEndpoint()">Call Protected API</button>
            <button (click)="getUserProfile()">Get Profile</button>
            <button (click)="getFirstTransaction()">Get First Transaction</button>
            <button (click)="logout()">Log Out</button>
          </ng-container>
          <ng-template #loggedOut>
            <button (click)="login()">Log In</button>
          </ng-template>
        </div>
      </div>

      <div class="content">
        <div class="section">
          <h2>Authentication Status</h2>
          <div *ngIf="auth.isAuthenticated$ | async; else notAuthenticated">
            <p>✓ Authenticated</p>
            <div *ngIf="auth.user$ | async as user">
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Name:</strong> {{ user.name }}</p>
            </div>
          </div>
          <ng-template #notAuthenticated>
            <p>✗ Not Authenticated</p>
          </ng-template>
        </div>

        <div class="section">
          <h2>Public API Response</h2>
          <button (click)="callPublicEndpoint()">Call Public API</button>
          <div *ngIf="publicMessage" class="response">
            {{ publicMessage }}
          </div>
        </div>

        <div class="section">
          <h2>Protected API Response</h2>
          <div *ngIf="protectedData" class="response">
            <pre>{{ protectedData | json }}</pre>
          </div>
        </div>

        <div class="section">
          <h2>User Profile Data</h2>
          <div *ngIf="profileData" class="response">
            <pre>{{ profileData | json }}</pre>
          </div>
        </div>

        <div class="section">
          <h2>First Transaction</h2>
          <div *ngIf="transactionData" class="response">
            <pre>{{ transactionData | json }}</pre>
          </div>
        </div>

        <div *ngIf="error" class="error">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      h1 {
        margin: 0;
      }
      .auth-buttons {
        display: flex;
        gap: 10px;
      }
      button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      }
      button:hover {
        background-color: #0056b3;
      }
      .content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .section {
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .section h2 {
        margin-top: 0;
        font-size: 18px;
      }
      .response {
        margin-top: 10px;
        padding: 10px;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-family: monospace;
        font-size: 12px;
      }
      .error {
        color: red;
        padding: 10px;
        background-color: #ffe6e6;
        border: 1px solid red;
        border-radius: 3px;
        margin-top: 20px;
        grid-column: 1 / -1;
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  publicMessage: string | null = null;
  protectedData: any = null;
  profileData: any = null;
  transactionData: any = null;
  error: string | null = null;

  constructor(
    public auth: Auth0Service,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Optionally call public endpoint on load
    this.callPublicEndpoint();
  }

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  callPublicEndpoint() {
    this.error = null;
    this.authService.getPublicData().subscribe({
      next: (data) => {
        this.publicMessage = data.message;
      },
      error: (err) => {
        this.error = 'Failed to load public data: ' + err.message;
      }
    });
  }

  callProtectedEndpoint() {
    this.error = null;
    this.protectedData = null;
    this.authService.getProtectedData().subscribe({
      next: (data) => {
        this.protectedData = data;
      },
      error: (err) => {
        this.error = 'Failed to load protected data: ' + err.message;
      }
    });
  }

  getUserProfile() {
    this.error = null;
    this.profileData = null;
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        this.profileData = data;
      },
      error: (err) => {
        this.error = 'Failed to load profile data: ' + err.message;
      }
    });
  }

  getFirstTransaction() {
    this.error = null;
    this.transactionData = null;
    this.authService.getFirstTransaction().subscribe({
      next: (data) => {
        this.transactionData = data;
      },
      error: (err) => {
        this.error = 'Failed to load transaction data: ' + err.message;
      }
    });
  }
}
