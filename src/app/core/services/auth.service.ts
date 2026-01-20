import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getPublicData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/example`);
  }

  getProtectedData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/protected`);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`);
  }
}
