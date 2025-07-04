import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Entreprise } from '../../models/entreprises';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private apiUrl = 'http://localhost:8000/api/entreprises';

  constructor(private http: HttpClient) {}

  // Création d'un en-tête d'authentification avec le token
  private createAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required - no token available');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getEntreprises(): Observable<Entreprise[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<Entreprise[]>(`${this.apiUrl}/getEntreprises`, { headers });
  }

  getEntrepriseById(id: number): Observable<Entreprise> {
    const headers = this.createAuthHeaders();
    return this.http.get<Entreprise>(`${this.apiUrl}/getEntrepriseById/${id}`, { headers });
  }

  addEntreprise(entreprise: Entreprise): Observable<{ message: string, entreprise: Entreprise }> {
    const payload = {
      ...entreprise,
      capital_social: Number(entreprise.capital_social),
      nombre_employes: Number(entreprise.nombre_employes),
      tva_applicable: Boolean(entreprise.tva_applicable),
      superadmin_assigne: Number(entreprise.superadmin_assigne),
    };
    const headers = this.createAuthHeaders();
    return this.http.post<{ message: string, entreprise: Entreprise }>(`${this.apiUrl}/addEntreprise`, payload, { headers });
  }

  updateEntreprise(id: number, entreprise: Entreprise): Observable<Entreprise> {
    const headers = this.createAuthHeaders();
    return this.http.put<Entreprise>(`${this.apiUrl}/updateEntreprise/${id}`, entreprise, { headers });
  }

  deleteEntreprise(id: number): Observable<void> {
    const headers = this.createAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/deleteEntreprise/${id}`, { headers });
  }

  validateEntreprise(id: number): Observable<Entreprise> {
    const headers = this.createAuthHeaders();
    return this.http.post<Entreprise>(`${this.apiUrl}/${id}/valider`, {}, { headers });
  }

  rejectEntreprise(id: number): Observable<Entreprise> {
    const headers = this.createAuthHeaders();
    return this.http.post<Entreprise>(`${this.apiUrl}/${id}/reject`, {}, { headers });
  }

  getTransactionHistory(id: number): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/${id}/transactions/getTransactionHistory`, { headers });
  }

  // GET secteurs
  getSecteurs(): Observable<string[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<string[]>('http://localhost:8000/api/entreprises/getSecteurs/list', { headers });
  }

  getEntreprisesBySector(sector: string): Observable<Entreprise[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<Entreprise[]>(`${this.apiUrl}/secteurs/${sector}`, { headers });
  }

  getActiveEntreprises(): Observable<Entreprise[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<Entreprise[]>(`${this.apiUrl}/actives/list`, { headers });
  }

  getRecentEntreprises(days: number = 30): Observable<Entreprise[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<Entreprise[]>(`${this.apiUrl}/recents/${days}`, { headers });
  }
}
