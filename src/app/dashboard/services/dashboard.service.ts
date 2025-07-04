import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/dashboard';

  constructor(private http: HttpClient) { }

  private getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Token from storage:', token);  // Ajoutez cette ligne pour vérifier si le token est correctement récupéré.
    return token;
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required - no token available');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getDashboardData(): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.get(`${this.apiUrl}/index`, { headers });
  }

  getChartData(type: string, view: string): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.get(`${this.apiUrl}/chart-data?type=${type}&view=${view}`, { headers });
  }

  getAnomalyAlerts(): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.get(`${this.apiUrl}/anomaly-alerts`, { headers });
  }

  getRealTimeOrders(): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.get(`${this.apiUrl}/real-time-orders`, { headers });
  }

  getCardDetails(cardType: string): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.get(`${this.apiUrl}/card/${cardType}`, { headers });
  }
}
