import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth0 } from '@auth0/auth0-angular';
import { authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authHttpInterceptorFn])
    ),
    provideAuth0({
      domain: 'connelaide.us.auth0.com',  // Replace with your Auth0 domain
      clientId: '3TWfrBt4Gk37uzUxsJbYoJ6P2f7U7fGd',  // Replace with your Auth0 client ID
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'https://api.connelaide.com',  // Replace with your API audience
      },
      httpInterceptor: {
        allowedList: [
          {
            uri: '/api/v1/protected*',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/user/*',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/transactions',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/transactions/*',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/connalaide-categories',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/connalaide-categories/*',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/pay-periods',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/pay-periods/*',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/projected-expenses',
            allowAnonymous: false
          },
          {
            uri: '/api/v1/projected-expenses/*',
            allowAnonymous: false
          }
        ]
      }
    })
  ]
};
