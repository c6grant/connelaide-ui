import { Component } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterLink, RouterLinkActive, MenubarModule, ButtonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo-nav">
          <h1 class="logo">Connelaide</h1>
          <nav class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
            <a routerLink="/categories" routerLinkActive="active">Categories</a>
          </nav>
        </div>
        <div class="auth-buttons">
          <ng-container *ngIf="auth.isAuthenticated$ | async; else loggedOut">
            <span class="user-info" *ngIf="auth.user$ | async as user">
              {{ user.name || user.email }}
            </span>
            <p-button label="Log Out" (onClick)="logout()" [outlined]="true" severity="secondary"></p-button>
          </ng-container>
          <ng-template #loggedOut>
            <p-button label="Log In" (onClick)="login()"></p-button>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      padding: 0 20px;
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }
    .logo-nav {
      display: flex;
      align-items: center;
      gap: 40px;
    }
    .logo {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
    .nav-links {
      display: flex;
      gap: 24px;
    }
    .nav-links a {
      text-decoration: none;
      color: #6b7280;
      font-weight: 500;
      padding: 8px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-links a:hover {
      color: #1f2937;
    }
    .nav-links a.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }
    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-info {
      color: #4b5563;
      font-size: 14px;
    }
  `]
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}
