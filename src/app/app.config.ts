import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';
import { authHttpInterceptorFn } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
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
            uri: 'https://connelaide.com/api/v1/protected*',
            tokenOptions: {
              authorizationParams: {
                audience: 'https://api.connelaide.com',  // Replace with your API audience
              }
            }
          },
          {
            uri: 'https://connelaide.com/api/v1/user/*',
            tokenOptions: {
              authorizationParams: {
                audience: 'https://api.connelaide.com',  // Replace with your API audience
              }
            }
          },
          {
            uri: 'http://localhost:4200/api/v1/protected*',
            tokenOptions: {
              authorizationParams: {
                audience: 'https://api.connelaide.com',
              }
            }
          },
          {
            uri: 'http://localhost:4200/api/v1/user/*',
            tokenOptions: {
              authorizationParams: {
                audience: 'https://api.connelaide.com',
              }
            }
          }
        ]
      }
    })
  ]
};
