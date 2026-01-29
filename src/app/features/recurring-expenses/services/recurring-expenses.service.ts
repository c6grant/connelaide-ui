import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecurringExpense, RecurringExpenseCreate, RecurringExpenseUpdate } from '../../../shared/models/recurring-expense.model';

@Injectable({
  providedIn: 'root'
})
export class RecurringExpensesService {
  private apiUrl = '/api/v1/recurring-expenses';

  constructor(private http: HttpClient) {}

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.http.get<RecurringExpense[]>(this.apiUrl);
  }

  createRecurringExpense(data: RecurringExpenseCreate): Observable<RecurringExpense> {
    return this.http.post<RecurringExpense>(this.apiUrl, data);
  }

  updateRecurringExpense(id: number, data: RecurringExpenseUpdate): Observable<RecurringExpense> {
    return this.http.patch<RecurringExpense>(`${this.apiUrl}/${id}`, data);
  }

  deleteRecurringExpense(id: number, deleteFuture: boolean = true): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: { delete_future: deleteFuture.toString() }
    });
  }
}
