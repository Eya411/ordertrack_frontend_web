import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../../models/transactions';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8000/api/entreprises/{entrepriseId}/transactions';

  constructor(private http: HttpClient) { }

  getTransactionHistory(entrepriseId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/${entrepriseId}/getTransactionHistory`);
  }

  addTransaction(entrepriseId: number, transactionData: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/${entrepriseId}/addTransaction`, transactionData);
  }
}