import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ClientService } from '../../clients/service/client.service';
import { EntrepriseService } from '../../entreprises/services/entreprise.service';
import { Commande } from '../../models/commande';
import { DashboardUpdateService } from '../../shared/dashboard-update.service';
import { CommandeService } from '../service/commande.service';
@Component({
  selector: 'app-commande-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './commande-edit.component.html',
  styleUrls: ['./commande-edit.component.css']
})
export class CommandeEditComponent implements OnInit {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  clients: any[] = [];
  entreprises: any[] = [];
  isLoading = true;
  isEditing = false;
  selectedCommande: Commande | null = null;
  commandeForm: FormGroup;
  searchTerm = '';
  statutFilter = '';
  pageArray: number[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  paginatedCommandes: Commande[] = [];
  selectedCommandeId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showDeleteConfirmation: boolean = false;

  // États pour les modales
  showCommandeModal: boolean = false;
  showDetailsModal: boolean = false;
  showDeleteModal: boolean = false;

  commandeIdToDelete: number | null = null;

  constructor(
    private commandeService: CommandeService,
    private clientService: ClientService,
    private entrepriseService: EntrepriseService,
    private fb: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private dashboardUpdateService: DashboardUpdateService,
  ) {
    this.commandeForm = this.fb.group({
      numero_commande: ['', [Validators.required, Validators.maxLength(50)]],
      entreprise_id: ['', Validators.required],
      client_id: [null],
      statut: ['en attente', Validators.required],
      montant_total: [0, [Validators.required, Validators.min(0)]],
      avance_payee: [0, [Validators.required, Validators.min(0)]],
      adresse_livraison: [null],
      commentaires: [null, Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  // Autres méthodes existantes...
  loadEntreprisesEtClients(): void {
    forkJoin({
      entreprises: this.entrepriseService.getEntreprises(),
      clients: this.clientService.getClients()
    }).subscribe({
      next: ({ entreprises, clients }) => {
        this.entreprises = entreprises;
        this.clients = clients;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.clearMessages();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadEntreprisesEtClients();
    this.loadCommandes();
  }

  loadClientsByEntreprise(entrepriseId: number): void {
    this.clientService.getClientsByEntreprise(entrepriseId).subscribe({
      next: (clients) => {
        this.clients = clients;
        if (!clients.some(c => c.id === this.commandeForm.get('client_id')?.value)) {
          this.commandeForm.patchValue({ client_id: null });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des clients:', err);
        this.errorMessage = 'Erreur lors du chargement des clients';
        this.clearMessages();
      }
    });
  }

  loadCommandes(): void {
    this.commandeService.getCommandes().subscribe({
      next: (commandes) => {
        this.commandes = commandes;
        this.filteredCommandes = [...this.commandes];
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.isLoading = false;
        this.clearMessages();
      }
    });
  }

  filterCommandes(): void {
    this.filteredCommandes = this.commandes.filter(commande => {
      const matchesSearch = this.searchTerm === '' ||
        commande.numero_commande.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getClientName(commande.client_id).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getEntrepriseName(commande.entreprise_id).toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatut = this.statutFilter === '' || commande.statut === this.statutFilter;

      return matchesSearch && matchesStatut;
    });

    this.currentPage = 1;
    this.calculatePagination();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statutFilter = '';
    this.filterCommandes();
  }



  getClientName(clientId: number | null): string {
    if (!clientId) return 'Non spécifié';
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.nom} ${client.prenom}` : 'Client inconnu';
  }

  getEntrepriseName(entrepriseId: number): string {
    const entreprise = this.entreprises.find(e => e.id === entrepriseId);
    return entreprise ? entreprise.nom : 'Entreprise inconnue';
  }

  openAddModal(): void {
    this.isEditing = false;
    this.selectedCommande = null;
    this.resetForm();
    this.showCommandeModal = true;

    if (this.entreprises.length === 0) {
      this.loadEntreprisesEtClients();
    }
  }


  submitForm(): void {
    if (this.commandeForm.valid) {
      const formData = this.commandeForm.value;

      formData.montant_total = Number(formData.montant_total);
      formData.avance_payee = Number(formData.avance_payee);

      if (this.isEditing && this.selectedCommande) {
        this.updateCommande(formData);
      } else {
        this.addCommande(formData);
      }
    }
  }

  updateCommande(formValues: any): void {
    if (!this.selectedCommande) return;

    const updatedCommande = { ...formValues, id: this.selectedCommande.id };
    this.commandeService.updateCommande(updatedCommande).subscribe({
      next: () => {
        this.loadData();
        this.showCommandeModal = false;
        this.successMessage = 'Commande mise à jour avec succès';
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.errorMessage = 'Erreur lors de la mise à jour de la commande';
        this.clearMessages();
      }
    });
  }

  addCommande(formValues: any): void {
    this.commandeService.addCommande(formValues).subscribe({
      next: () => {
        this.loadData();
        this.showCommandeModal = false;
        this.successMessage = 'Commande ajoutée avec succès';
        this.dashboardUpdateService.triggerUpdate(); // ✅ Rafraîchit le dashboard
        this.clearMessages();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de la commande:', error);
        this.errorMessage = 'Erreur lors de l\'ajout de la commande';
        this.clearMessages();
      }
    });
  }
  



  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCommandes.length / this.itemsPerPage);
    this.paginatedCommandes = this.filteredCommandes.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
    this.pageArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  trackByCommandeId(index: number, commande: Commande): number {
    return commande.id;
  }

  clearMessages(): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
    }, 3000);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }
  openCommandeModal(): void {
    this.showCommandeModal = true;
  }

  deleteCommande(): void {
    if (this.selectedCommandeId) {
      this.isLoading = true;

      this.commandeService.deleteCommande(this.selectedCommandeId).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadCommandes();
          this.showDeleteModal = false;
          this.successMessage = 'Commande supprimée avec succès';
          this.clearMessages();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la commande:', error);
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la suppression de la commande';
          this.clearMessages();
        }
      });
    }
  }

  openDetailsModal(): void {
    this.showDetailsModal = true;
  }

  openDeleteModal(id: number): void {
    this.selectedCommandeId = id;
    this.showDeleteModal = true;
  }

  closeModal(modalType: string): void {
    switch (modalType) {
      case 'commandeModal':
        this.showCommandeModal = false;
        break;
      case 'detailsModal':
        this.showDetailsModal = false;
        break;
      case 'deleteModal':
        this.showDeleteModal = false;
        break;
    }
    this.selectedCommande = null;
  }


  confirmDelete(): void {
    if (this.selectedCommandeId) {
      this.isLoading = true;

      this.commandeService.deleteCommande(this.selectedCommandeId).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadCommandes();
          this.showDeleteModal = false;
          this.successMessage = 'Commande supprimée avec succès';
          this.clearMessages();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la commande:', error);
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la suppression de la commande';
          this.clearMessages();
        }
      });
    }
  }


  // Modifier viewDetails pour utiliser openDetailsModal
  viewDetails(commande: Commande): void {
    this.selectedCommande = commande;
    this.openDetailsModal();
  }

  // Modifier selectCommande pour utiliser openCommandeModal
  selectCommande(commande: Commande): void {
    this.isEditing = true;
    this.selectedCommande = commande;
    this.openCommandeModal();

    // Le reste de la méthode reste inchangé...
    if (this.entreprises.length === 0) {
      this.loadEntreprisesEtClients();
    }

    this.loadClientsByEntreprise(commande.entreprise_id);

    this.commandeForm.patchValue({
      numero_commande: commande.numero_commande,
      entreprise_id: commande.entreprise_id,
      client_id: commande.client_id,
      statut: commande.statut,
      montant_total: commande.montant_total,
      avance_payee: commande.avance_payee,
      adresse_livraison: commande.adresse_livraison,
      commentaires: commande.commentaires
    });
  }


  resetForm(): void {
    this.commandeForm.reset({
      statut: 'en attente',
      montant_total: 0,
      avance_payee: 0,
      client_id: null,
      adresse_livraison: null,
      commentaires: null
    });
  }
}