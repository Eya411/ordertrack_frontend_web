import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commande } from '../../models/commande';

export interface CommandeFilter {
  statut?: string;
  date_commande?: string;
  page?: number;
  per_page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:8000/api/commandes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ✔️ Récupérer toutes les commandes avec pagination
  getCommandes(page: number = 1, perPage: number = 10): Observable<Commande[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<Commande[]>(`${this.apiUrl}/getCommandes`, { params, headers: this.getHeaders() });
  }

  // ✔️ Récupérer une commande par ID
  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/getCommandeById/${id}`, { headers: this.getHeaders() });
  }

  // ✔️ Ajouter une nouvelle commande
  addCommande(commande: Commande): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/addCommande`, commande, { headers: this.getHeaders() });
  }

  // ✔️ Mettre à jour une commande
  updateCommande(commande: Commande & { id: number }): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/updateCommande/${commande.id}`, commande, { headers: this.getHeaders() });
  }

  // ❗️ Correction de l’URL de suppression
  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getHeaders() });
  }

  // ✔️ Filtrer les commandes
  filterCommandes(filters: CommandeFilter): Observable<Commande[]> {
    let params = new HttpParams();

    if (filters.statut) params = params.set('statut', filters.statut);
    if (filters.date_commande) params = params.set('date_commande', filters.date_commande);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.per_page) params = params.set('per_page', filters.per_page.toString());

    return this.http.get<Commande[]>(`${this.apiUrl}/filterCommandes`, { params, headers: this.getHeaders() });
  }
}
