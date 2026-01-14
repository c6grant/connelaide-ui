import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  // Call public endpoint
  getPublicData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/example`);
  }

  // Call protected endpoint (token automatically added by Auth0 interceptor)
  getProtectedData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/protected`);
  }

  // Get user profile
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`);
  }

  // Get first transaction
  getFirstTransaction(): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/first`);
  }
}
