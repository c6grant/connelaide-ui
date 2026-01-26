import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectedExpense, ProjectedExpenseCreate, ProjectedExpenseUpdate } from '../../../shared/models/projected-expense.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectedExpensesService {
  private apiUrl = '/api/v1/projected-expenses';

  constructor(private http: HttpClient) {}

  getProjectedExpenses(startDate: string, endDate: string): Observable<ProjectedExpense[]> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get<ProjectedExpense[]>(this.apiUrl, { params });
  }

  createProjectedExpense(data: ProjectedExpenseCreate): Observable<ProjectedExpense> {
    return this.http.post<ProjectedExpense>(this.apiUrl, data);
  }

  updateProjectedExpense(id: number, data: ProjectedExpenseUpdate): Observable<ProjectedExpense> {
    return this.http.patch<ProjectedExpense>(`${this.apiUrl}/${id}`, data);
  }

  deleteProjectedExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
