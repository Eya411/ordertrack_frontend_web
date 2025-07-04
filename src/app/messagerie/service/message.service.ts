import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private apiUrl = 'http://localhost:8000/api/admin';

  constructor(private http: HttpClient) {}

  listMessagerie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listMessagerie`);
  }

  addMessagerie(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addMessagerie/ajouter`, data);
  }

  afficheMessagerie(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/afficheMessagerie/${id}`);
  }

  modifierMessagerie(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/modifierMessagerie/${id}/modifier`, data);
  }

  mettreAJourMessagerie(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/mettreAJourMessagerie/${id}/mettre-a-jour`, data);
  }

  supprimerMessagerie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimerMessagerie/${id}`);
  }
}
