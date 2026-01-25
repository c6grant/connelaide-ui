import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayPeriod, PayPeriodCreate, PayPeriodUpdate } from '../../../shared/models/pay-period.model';

@Injectable({
  providedIn: 'root'
})
export class PayPeriodsService {
  private apiUrl = '/api/v1/pay-periods';

  constructor(private http: HttpClient) {}

  getPayPeriods(): Observable<PayPeriod[]> {
    return this.http.get<PayPeriod[]>(this.apiUrl);
  }

  getPayPeriod(id: number): Observable<PayPeriod> {
    return this.http.get<PayPeriod>(`${this.apiUrl}/${id}`);
  }

  createPayPeriod(data: PayPeriodCreate): Observable<PayPeriod> {
    return this.http.post<PayPeriod>(this.apiUrl, data);
  }

  updatePayPeriod(id: number, data: PayPeriodUpdate): Observable<PayPeriod> {
    return this.http.patch<PayPeriod>(`${this.apiUrl}/${id}`, data);
  }

  deletePayPeriod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
