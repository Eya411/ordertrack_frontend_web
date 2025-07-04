import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Alerte } from '../../models/alerte.model';

@Injectable({
    providedIn: 'root'
})
export class AnomalyAlertService {
    private apiUrl = 'http://localhost:8000/api/alertes'; // Assurez-vous que l'URL est correcte

    constructor(private http: HttpClient) { }

    // Récupérer le token depuis localStorage
    private getToken(): string | null {
        const token = localStorage.getItem('token');
        console.log('Token from storage:', token);  // Ajoutez cette ligne pour vérifier si le token est correctement récupéré.
        return token;
    }

    // Vérifier que le token est disponible
    private ensureToken(): string {
        const token = this.getToken();
        if (!token) {
            throw new Error('Authentication required - no token available');
        }
        return token;
    }

    // Récupérer la liste des alertes avec les headers corrects
    getAlerts(): Observable<Alerte[]> {
        const token = this.ensureToken();
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        return this.http.get<Alerte[]>(`${this.apiUrl}`, { headers }).pipe(
            catchError(error => {
                console.error('Error fetching alerts:', error);
                return throwError(() => new Error('Error fetching alerts'));
            })
        );
    }

    // Marquer une alerte comme lue avec le token dans les headers
    markAsRead(alertId: number): Observable<any> {
        const token = this.ensureToken();

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.post(`${this.apiUrl}/marquer-lue`,
            { alerte_id: alertId },
            { headers }
        ).pipe(
            catchError(error => {
                console.error('Error marking alert as read:', error);
                return throwError(() => new Error('Error marking alert as read'));
            })
        );
    }
}
