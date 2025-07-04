import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardUpdateService {
  // Crée un sujet pour les mises à jour
  private updateDashboardSource = new Subject<void>();

  // Expose l'Observable à d'autres composants
  updateDashboard$ = this.updateDashboardSource.asObservable();

  // Méthode pour déclencher la mise à jour
  triggerUpdate(): void {
    this.updateDashboardSource.next();
  }
}
