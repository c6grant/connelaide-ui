import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, RefreshStatus, RefreshResponse } from '../../../shared/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = '/api/v1/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(startDate: string, endDate: string): Observable<Transaction[]> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, updates);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRefreshStatus(): Observable<RefreshStatus> {
    return this.http.get<RefreshStatus>(`${this.apiUrl}/refresh-status`);
  }

  refreshTransactions(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, {});
  }
}
