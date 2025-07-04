import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardUpdateService {
  private dataUpdatedSubject = new BehaviorSubject<void>(null); // Remplacez `void` par le type approprié
  dataUpdated$ = this.dataUpdatedSubject.asObservable();  // Observable que les composants peuvent s'abonner

  constructor() {}

  updateData() {
    // Logique pour mettre à jour les données
    this.dataUpdatedSubject.next();  // Déclenche une mise à jour des données
  }
}
