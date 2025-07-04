import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../../models/clients';

@Injectable({ providedIn: 'root' })
export class ClientService {
    private baseUrl = 'http://localhost:8000/api/clients';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getClients(): Observable<Client[]> {
        return this.http.get<Client[]>(`${this.baseUrl}/getClients`, {
            headers: this.getHeaders()
        });
    }

    addClient(clientData: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/addClient`, clientData, {
            headers: this.getHeaders()
        });
    }

    filterClients(filters: any): Observable<Client[]> {
        return this.http.get<Client[]>(`${this.baseUrl}/filterClient`, {
            params: filters,
            headers: this.getHeaders()
        });
    }

    updateClient(id: number, clientData: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/updateClient/${id}`, clientData, {
            headers: this.getHeaders()
        });
    }

    deleteClient(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/delete/${id}`, {
            headers: this.getHeaders()
        });
    }

    resetPassword(id: number, mot_de_passe: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/reset-password/${id}`, { mot_de_passe }, {
            headers: this.getHeaders()
        });
    }

    getClientOrders(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/orders/${id}`, {
            headers: this.getHeaders()
        });
    }

    getClientActivity(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/getClientActivity/${id}`, {
            headers: this.getHeaders()
        });
    }

    getClientsByEntreprise(entrepriseId: number): Observable<Client[]> {
        return this.http.get<Client[]>(`${this.baseUrl}/by-entreprise/${entrepriseId}`, {
            headers: this.getHeaders()
        });
    }
}
