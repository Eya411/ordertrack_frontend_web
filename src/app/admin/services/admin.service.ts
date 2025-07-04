import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Admin } from '../../models/admin';

export interface AdminResponse extends Admin {
  created_at?: string;
  updated_at?: string;
  showPassword?: boolean;
  date_creation?: string;
  date_derniere_connexion?: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAdmins(): Observable<{ success: boolean; data: AdminResponse[] }> {
    return this.http.get<{ success: boolean; data: AdminResponse[] }>(
      `${this.apiUrl}/getAdmins`,
      { headers: this.getHeaders() }
    );
  }

  getAdminById(id: number): Observable<{ success: boolean; data: Admin }> {
    return this.http.get<{ success: boolean; data: Admin }>(
      `${this.apiUrl}/getAdminById/${id}`,
      { headers: this.getHeaders() }
    );
  }

  addAdmin(admin: Partial<Admin> & { password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/addAdmin`, admin, { headers: this.getHeaders() });
  }

  updateAdmin(id: number, admin: Partial<Admin> & { password_confirmation?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateAdmin/${id}`, admin, { headers: this.getHeaders() });
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteAdmin/${id}`, { headers: this.getHeaders() });
  }

  permanentDelete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/permanent`, { headers: this.getHeaders() });
  }

  markAsDeleted(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/mark-deleted`, {}, { headers: this.getHeaders() });
  }

  restoreAdmin(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() });
  }

  getRoles(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(
      `${this.apiUrl}/roles`,
      { headers: this.getHeaders() }
    );
  }

  getStatuses(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(
      `${this.apiUrl}/statuses`,
      { headers: this.getHeaders() }
    );
  }

  deleteAdminDefinitively(id: number): Observable<any> {
    return this.permanentDelete(id);
  }
}
