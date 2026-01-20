import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/user/stats`);
  }

  getSpendingByCategory(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/user/spending-by-category`);
  }

  getMonthlyTrend(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/user/monthly-trend`);
  }
}
