import { CommonModule } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { Entreprise } from '../../models/entreprises';
import { Transaction } from '../../models/transactions';
import { DashboardUpdateService } from '../../shared/dashboard-update.service';
import { EntrepriseService } from '../services/entreprise.service';

@Component({
  selector: 'app-entreprise-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './entreprise-form.component.html',
  styleUrls: ['./entreprise-form.component.css']
})
export class EntrepriseFormComponent implements OnInit {
  entreprises: Entreprise[] = [];
  filteredEntreprises: Entreprise[] = [];
  transactionHistory: Transaction[] = [];

  selectedEntrepriseId: number | null = null;
  entrepriseIdToDelete: number | null = null;
  entrepriseToUpdate: Entreprise | null = null;

  entreprise: Entreprise = this.getDefaultEntreprise();

  secteurs: string[] = [];
  paymentMethods: string[] = ['virement', 'chèque', 'carte bancaire'];

  searchNom: string = '';
  selectedStatut: string = '';
  selectedSecteur: string = '';
  searchPaiement: string = '';
  newSector = '';

  loading: boolean = false;
  showAddEntrepriseForm: boolean = false;
  showTransactionHistoryModal: boolean = false;
  showUpdateForm: boolean = false;
  showDeleteConfirmation: boolean = false;
  showSuccessMessage: boolean = false;
  showNewSectorInput = false;

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private entrepriseService: EntrepriseService,
    private router: Router,
    private dashboardUpdateService: DashboardUpdateService,
    private authService: AuthService,
    private http: HttpClient
  ) { }


  ngOnInit(): void {
    this.http.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true }).subscribe({
      next: () => {
        const token = this.authService.getToken();  // Assure-toi que le token est récupéré avant d'envoyer la requête.
        this.http.get('http://localhost:8000/api/user', {
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        }).subscribe({
          next: (user) => {
            console.log('✅ Connecté via Angular', user);
            this.loadInitialData();
          },
          error: (err) => {
            console.error('❌ Non connecté via Angular', err);
            this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          }
        });
      },
      error: (err) => {
        console.error('❌ CSRF cookie non récupéré', err);
      }
    });
  }
  

  
  

  private getDefaultEntreprise(): Entreprise {
    return {
      id: 0,
      matricule_fiscal: '',
      registre_commerce: '',
      forme_juridique: '',
      capital_social: 0,
      statut_juridique: '',
      nom: '',
      raison_sociale: '',
      secteur_activite: '',
      description: '',
      adresse: '',
      telephone: '',
      email: '',
      pays_region: '',
      numero_compte: '',
      nom_banque: '',
      devise: 'EUR',
      tva_applicable: false,
      methode_paiement: 'virement',
      nom_dirigeant: '',
      nom_representant_legal: '',
      nombre_employes: 0,
      date_creation: '',
      identifiant_unique: '',
      statut_entreprise: 'actif',
      superadmin_assigne: '',
      date_inscription: new Date().toISOString().split('T')[0],
      created_at: '',
      updated_at: ''
    };
  }


  private loadInitialData(): void {
    this.loading = true;
    this.entrepriseService.getEntreprises().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.entreprises = data;
        this.filteredEntreprises = [...data];
      },
      error: (error) => this.handleError('Erreur lors du chargement des entreprises', error)
    });

    this.entrepriseService.getSecteurs().subscribe({
      next: (data: string[]) => this.secteurs = data,
      error: (error: any) => {
        console.error('Erreur lors du chargement des secteurs', error);
        this.secteurs = ['Commerce', 'Services', 'Industrie', 'Agriculture', 'Technologies'];
      }
    });
  }
  private getSecteurs(): void {
      this.entrepriseService.getSecteurs().subscribe({
        next: (data: string[]) => this.secteurs = data,
        error: (error: any) => {
          console.error('Erreur lors du chargement des secteurs', error);
          this.secteurs = ['Commerce', 'Services', 'Industrie', 'Agriculture', 'Technologies'];
        }
      });
    };
  

  filterEntreprises(): void {
    this.filteredEntreprises = this.entreprises.filter(entreprise => {
      const matches = [
        this.searchNom ? entreprise.nom.toLowerCase().includes(this.searchNom.toLowerCase()) : true,
        this.selectedStatut ? entreprise.statut_entreprise === this.selectedStatut : true,
        this.selectedSecteur ? entreprise.secteur_activite === this.selectedSecteur : true,
        this.searchPaiement ? entreprise.methode_paiement.toLowerCase().includes(this.searchPaiement.toLowerCase()) : true
      ];
      return matches.every(Boolean);
    });
  }


  resetFilters(): void {
    this.searchNom = '';
    this.selectedStatut = '';
    this.selectedSecteur = '';
    this.searchPaiement = '';
    this.filteredEntreprises = [...this.entreprises];
  }

  openAddEntrepriseForm(): void {
    this.entreprise = this.getDefaultEntreprise();
    this.showAddEntrepriseForm = true;
  }

  addEntreprise(): void {
    this.loading = true;

    const payload: Entreprise = {
      ...this.entreprise,
      capital_social: Number(this.entreprise.capital_social),
      nombre_employes: Number(this.entreprise.nombre_employes),
      superadmin_assigne: Number(this.entreprise.superadmin_assigne),
      tva_applicable: !!this.entreprise.tva_applicable
    };

    this.entrepriseService.addEntreprise(payload).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        const newEntreprise = response.entreprise;
        this.entreprises.push(newEntreprise);
        this.filteredEntreprises = [...this.entreprises];
        this.showSuccess('Entreprise ajoutée avec succès');
        this.closeAddEntrepriseForm();
        this.dashboardUpdateService.triggerUpdate();
      },
      error: (error: any) => this.handleError("Erreur lors de l'ajout de l'entreprise", error)
    });
  }

  openUpdateForm(entreprise: Entreprise): void {
    this.entrepriseToUpdate = { ...entreprise };
    this.showUpdateForm = true;
  }

  updateEntreprise(): void {
    if (!this.entrepriseToUpdate?.id) {
      this.errorMessage = 'Identifiant entreprise manquant';
      return;
    }

    this.loading = true;
    this.entrepriseService.updateEntreprise(
      this.entrepriseToUpdate.id,
      this.entrepriseToUpdate
    ).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (updatedEntreprise) => {
        const index = this.entreprises.findIndex(e => e.id === updatedEntreprise.id);
        if (index !== -1) {
          this.entreprises[index] = updatedEntreprise;
          this.filteredEntreprises = [...this.entreprises];
        }
        this.showSuccess('Entreprise mise à jour avec succès');
        this.closeUpdateForm();
      },
      error: (error) => this.handleError("Erreur lors de la mise à jour de l'entreprise", error)
    });
  }

  openDeleteConfirmation(id: number): void {
    this.entrepriseIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (!this.entrepriseIdToDelete) return;

    this.loading = true;
    this.entrepriseService.deleteEntreprise(this.entrepriseIdToDelete).pipe(
      finalize(() => {
        this.loading = false;
        this.closeDeleteConfirmation();
      })
    ).subscribe({
      next: () => {
        this.entreprises = this.entreprises.filter(e => e.id !== this.entrepriseIdToDelete);
        this.filteredEntreprises = this.filteredEntreprises.filter(e => e.id !== this.entrepriseIdToDelete);
        this.showSuccess('Entreprise supprimée avec succès');
      },
      error: (error) => this.handleError("Erreur lors de la suppression de l'entreprise", error)
    });
  }

  viewTransactionHistory(entrepriseId: number): void {
    this.selectedEntrepriseId = entrepriseId;
    this.loading = true;

    this.entrepriseService.getTransactionHistory(entrepriseId).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.transactionHistory = data.transactions;
        this.showTransactionHistoryModal = true;
      },
      error: (error) => this.handleError("Erreur lors du chargement de l'historique des transactions", error)
    });
  }

  validateEntreprise(id: number): void {
    this.loading = true;
    this.entrepriseService.validateEntreprise(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (updatedEntreprise) => {
        const index = this.entreprises.findIndex(e => e.id === id);
        if (index !== -1) {
          this.entreprises[index] = updatedEntreprise;
          this.filteredEntreprises = [...this.entreprises];
        }
        this.showSuccess('Entreprise validée avec succès');
      },
      error: (error) => this.handleError("Erreur lors de la validation de l'entreprise", error)
    });
  }

  rejectEntreprise(id: number): void {
    this.loading = true;
    this.entrepriseService.rejectEntreprise(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (updatedEntreprise) => {
        const index = this.entreprises.findIndex(e => e.id === id);
        if (index !== -1) {
          this.entreprises[index] = updatedEntreprise;
          this.filteredEntreprises = [...this.entreprises];
        }
        this.showSuccess('Entreprise rejetée');
      },
      error: (error) => this.handleError("Erreur lors du rejet de l'entreprise", error)
    });
  }

  closeAddEntrepriseForm(): void {
    this.showAddEntrepriseForm = false;
    this.errorMessage = '';
  }

  closeUpdateForm(): void {
    this.showUpdateForm = false;
    this.entrepriseToUpdate = null;
    this.errorMessage = '';
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.entrepriseIdToDelete = null;
  }

  closeTransactionHistory(): void {
    this.showTransactionHistoryModal = false;
    this.selectedEntrepriseId = null;
    this.transactionHistory = [];
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.entrepriseIdToDelete = null;
  }


  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => this.showSuccessMessage = false, 3000);
  }

  private handleError(context: string, error: any): void {
    console.error(context, error);
    this.errorMessage = error.error?.message ||
      (error.error?.errors ? Object.values(error.error.errors).flat().join(', ') :
        error.message || 'Une erreur est survenue');
  }


  addNewSector(): void {
    if (!this.newSector?.trim()) return;

    const sector = this.newSector.trim();
    if (this.secteurs.includes(sector)) {
      this.errorMessage = "Ce secteur existe déjà";
      setTimeout(() => this.errorMessage = "", 3000);
      return;
    }

    this.secteurs.push(sector);
    this.secteurs.sort();

    if (this.entreprise) {
      this.entreprise.secteur_activite = sector;
    }

    if (this.entrepriseToUpdate) {
      this.entrepriseToUpdate.secteur_activite = sector;
    }

    this.newSector = '';
    this.showNewSectorInput = false;
  }


  trackById(index: number, item: Entreprise): number {
    return item.id;
  }
}