import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnalaideCategory } from '../../../shared/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl = '/api/v1/connalaide-categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ConnalaideCategory[]> {
    return this.http.get<ConnalaideCategory[]>(this.apiUrl);
  }

  getCategory(id: number): Observable<ConnalaideCategory> {
    return this.http.get<ConnalaideCategory>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: { name: string }): Observable<ConnalaideCategory> {
    return this.http.post<ConnalaideCategory>(this.apiUrl, data);
  }

  updateCategory(id: number, data: { name: string }): Observable<ConnalaideCategory> {
    return this.http.patch<ConnalaideCategory>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
