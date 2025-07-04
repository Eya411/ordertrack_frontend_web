import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompteSecondaire } from '../../models/comptes-secondaires';

@Injectable({
  providedIn: 'root'
})
export class CompteSecondaireService {
  private apiUrl = 'http://localhost:8000/api/comptes-secondaires';

  constructor(private http: HttpClient) { }

  // Private method to get the token from localStorage
  private getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Token from storage:', token);  // For debugging purposes
    return token;
  }

  // Private method to create authorization headers
  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token non disponible. Veuillez vous reconnecter.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }


  // Récupérer tous les comptes secondaires
  getComptesSecondaires(): Observable<CompteSecondaire[]> {
    const headers = this.createAuthHeaders();
    return this.http.get<CompteSecondaire[]>(`${this.apiUrl}/getComptesSecondaires`, { headers });
  }

  // Récupérer un compte secondaire par ID
  getCompteSecondaireById(id: number): Observable<CompteSecondaire> {
    const headers = this.createAuthHeaders();
    return this.http.get<CompteSecondaire>(`${this.apiUrl}/getCompteSecondaireById/${id}`, { headers });
  }

  // Ajouter un nouveau compte secondaire
  addCompteSecondaire(data: CompteSecondaire): Observable<CompteSecondaire> {
    const headers = this.createAuthHeaders();
    return this.http.post<CompteSecondaire>(`${this.apiUrl}/addCompteSecondaire`, data, { headers });
  }

  // Modifier un compte secondaire
  updateCompteSecondaire(id: number, data: Partial<CompteSecondaire>): Observable<CompteSecondaire> {
    const headers = this.createAuthHeaders();
    return this.http.put<CompteSecondaire>(`${this.apiUrl}/updateCompteSecondaire/${id}`, data, { headers });
  }

  // Supprimer un compte secondaire
  deleteCompteSecondaire(id: number): Observable<void> {
    const headers = this.createAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/deleteCompteSecondaire/${id}`, { headers });
  }

  // Réinitialiser le mot de passe
// Réinitialiser le mot de passe
// CompteSecondaireService
resetPassword(id: number, data: { password: string, password_confirmation: string }): Observable<void> {
  const headers = this.createAuthHeaders(); // Créer les en-têtes d'authentification

  return this.http.post<void>(
      `${this.apiUrl}/${id}/reset-password`, 
      data, // Envoi de l'objet avec le nouveau mot de passe et la confirmation
      { headers, withCredentials: true } // Assurez-vous d'envoyer les cookies si nécessaire
  );
}



}
