import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, finalize } from 'rxjs/operators';
import { EntrepriseService } from '../../entreprises/services/entreprise.service';
import { Client } from '../../models/clients';
import { DashboardUpdateService } from '../../shared/dashboard-update.service';
import { MessageService } from '../../shared/message.service';
import { ClientService } from '../service/client.service';
interface ClientFilter {
  nom?: string;
  entreprise_id?: string;
  statut?: string;
  nombre_commandes?: number;
  date_inscription?: Date;
}

interface Entreprise {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    RouterModule,
    MatDialogModule
  ]
})
export class ClientFormComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  searchNom: string = '';
  selectedEntreprise: any;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;
  clientForm: FormGroup;
  filterForm: FormGroup;
  passwordForm: FormGroup;
  selectedStatut: string = 'en_attente';
  showPassword: boolean = false;
  showPasswordConfirm: boolean = false;

  viewMode: 'list' | 'add' | 'edit' | 'details' | 'activities' | 'orders' | 'reset_password' = 'list';
  clientOrders: any[] = [];
  activities: any[] = [];
  entreprises: Entreprise[] = [];
  isLoading = false;
  isActivitiesLoading = false;
  isOrdersLoading = false;
  notificationMessage = '';
  dialogRef?: MatDialogRef<any>;
  showNewPassword = false;
  showConfirmPassword = false;
  showDeleteConfirmation = false;
  deleteConfirmationMessage = '';
  clientToDelete: any = null;
  displayedColumns: string[] = ['nom', 'email', 'entreprise', 'statut', 'nombre_commandes', 'date_inscription', 'actions'];
  orderColumns: string[] = ['reference', 'date', 'montant', 'statut', 'actions'];

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private entrepriseService: EntrepriseService,
    private router: Router, private dashboardUpdateService: DashboardUpdateService,
    private messageService: MessageService
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse_physique: [''],
      telephone: [''],
      entreprise_id: ['', Validators.required],
      statut: ['en_attente', Validators.required],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      nombre_commandes: [0]
    });

    this.filterForm = this.fb.group({
      nom: [''],
      entreprise_id: [''],
      statut: [''],
      nombre_commandes: [''],
      date_inscription: ['']
    });

    this.passwordForm = this.fb.group(
      {
        mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadEnterprises();
    this.clientForm = this.fb.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      adresse_physique: [''],
      telephone: [''],
      entreprise_id: ['', [Validators.required]],
      statut: ['', [Validators.required]],
      nombre_commandes: [0, [Validators.min(0)]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.applyFilter();
      });
  }

  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('mot_de_passe')?.value;
    const confirm = group.get('confirm_password')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  loadEnterprises(): void {
    this.entrepriseService.getEntreprises().subscribe({
      next: (data) => this.entreprises = data,
      error: () => this.showNotification('Erreur lors du chargement des entreprises', 'error')
    });
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data.map(client => ({
          ...client,
          date_inscription: this.convertToDate(client.date_inscription)
        }));
        this.filteredClients = [...this.clients];
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('Erreur lors du chargement des clients', 'error');
        this.isLoading = false;
      }
    });
  }
  private convertToDate(dateValue: any): string {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return formatted;
      }
    } else if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    return dateValue;
  }
  
parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(+year, +month - 1, +day); // mois indexé de 0 à 11
}

  
  getEntrepriseName(entrepriseId: number): string {
    if (!entrepriseId) return 'N/A';
    const entreprise = this.entreprises.find(e => e.id === entrepriseId);
    return entreprise ? entreprise.nom : 'N/A';
  }

  filterClients(): void {
    if (this.filterForm.valid) {
      const filters: any = {...this.filterForm.value};
      
      // Formater la date au format YYYY-MM-DD si elle existe
      if (filters.date_inscription) {
        filters.date_inscription = this.formatDate(filters.date_inscription);
      }
  
      if (!Object.values(filters).some(x => x !== null && x !== '' && x !== undefined)) {
        this.filteredClients = [...this.clients];
        return;
      }
  
      this.isLoading = true;
      this.clientService.filterClients(filters).subscribe({
        next: (filteredClients: Client[]) => {
          this.filteredClients = filteredClients;
          this.isLoading = false;
        },
        error: (error) => {
          this.showNotification('Erreur lors du filtrage des clients', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  // Ajoutez cette méthode pour formater la date
  private formatDate(date: Date | string): string {
    if (!date) return '';
    
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.filteredClients = [...this.clients];
  }

  showAddClientForm(): void {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse_physique: [''],
      telephone: [''],
      entreprise_id: ['', Validators.required],
      statut: ['en_attente', Validators.required],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      nombre_commandes: [0]
    });
    this.viewMode = 'add';
  }
  

  resetClientForm(): void {
    this.clientForm.reset({
      nom: '',
      email: '',
      adresse_physique: '',
      telephone: '',
      entreprise_id: '',
      statut: 'en_attente',
      mot_de_passe: '',
      nombre_commandes: 0
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.successMessage = message;
      setTimeout(() => this.successMessage = null, 5000);
    } else {
      this.errorMessage = message;
      setTimeout(() => this.errorMessage = null, 5000);
    }
  }

addClient(): void {
  // Si le formulaire est invalide, marquer tous les champs comme touchés pour afficher les erreurs
  if (this.clientForm.invalid) {
    this.clientForm.markAllAsTouched();
    return this.showNotification('Formulaire invalide', 'error');
  }

  // Désactivation de l'état de chargement pendant l'envoi
  this.isLoading = true;

  // Récupération des données du formulaire
  const clientData = this.clientForm.value;

  // Appel à la méthode addClient du service
  this.clientService.addClient(clientData).pipe(
    finalize(() => {
      this.isLoading = false; // Toujours exécuté, même si la requête échoue
    })
  ).subscribe({
    next: () => {
      this.showNotification('Client créé', 'success');
      this.loadClients();
      this.viewMode = 'list';
      this.dashboardUpdateService.triggerUpdate(); // Mise à jour du dashboard
    },
    error: (error) => {
      if (error.status === 422) {
        this.handleValidationErrors(error.error); // Gestion des erreurs de validation
      } else {
        // Affichage de message d'erreur générique si l'erreur n'est pas liée à la validation
        this.showNotification(error.error?.message || 'Erreur serveur', 'error');
      }
    }
  });
}


  
// Ajoutez cette méthode pour gérer les erreurs de validation
private handleValidationErrors(errorData: any): void {
    if (errorData.errors) {
        // Boucle sur les erreurs de validation
        Object.keys(errorData.errors).forEach(field => {
            const control = this.clientForm.get(field);
            if (control) {
                control.setErrors({ serverError: errorData.errors[field][0] });
            }
        });
        this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
    } else {
        this.showNotification(errorData.message || 'Erreur de validation', 'error');
    }
}

editClient(client: Client): void {
  this.selectedClient = client;
  this.clientForm = this.fb.group({
    nom: [client.nom, Validators.required],
    email: [client.email, [Validators.required, Validators.email]],
    adresse_physique: [client.adresse_physique || ''],
    telephone: [client.telephone || ''],
    entreprise_id: [client.entreprise_id, Validators.required],
    statut: [client.statut, Validators.required],
    nombre_commandes: [client.nombre_commandes || 0], // Assurez-vous que nombre_commandes est bien assigné
  });

  this.viewMode = 'edit';
}


updateClient(): void {
  if (!this.clientForm.valid) {
    this.clientForm.markAllAsTouched(); // Affiche les erreurs dans le template
    this.showNotification('Veuillez remplir correctement le formulaire', 'error');
    return;
  }

  if (!this.selectedClient) {
    this.showNotification('Aucun client sélectionné pour la mise à jour', 'error');
    return;
  }

  this.isLoading = true;
  const updatedClient = { ...this.clientForm.value };  // Nombre de commandes est dans la valeur du formulaire

  this.clientService.updateClient(this.selectedClient.id, updatedClient).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.showNotification(response.message || 'Client mis à jour avec succès', 'success');
      this.loadClients();
      this.viewMode = 'list';
    },
    error: (error) => {
      this.isLoading = false;
      this.showNotification(error.error?.message || 'Erreur lors de la mise à jour du client', 'error');
    }
  });
}

  
  

  deleteClient(client: Client): void {
    this.clientToDelete = client;
    this.deleteConfirmationMessage = `Êtes-vous sûr de vouloir supprimer le client ${client.nom} ?`;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.clientToDelete) {
      this.isLoading = true;
      this.clientService.deleteClient(this.clientToDelete.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.showNotification(`Le client ${this.clientToDelete?.nom} a été supprimé avec succès`, 'success');
          this.loadClients();
          this.showDeleteConfirmation = false;
          this.clientToDelete = null;
        },
        error: (error) => {
          this.isLoading = false;
          this.showNotification(`Erreur lors de la suppression du client: ${error.message}`, 'error');
          this.showDeleteConfirmation = false;
          this.clientToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.clientToDelete = null;
  }

  applyFilter(): void {
    this.filterClients();
  }

  showResetPasswordForm(client: Client): void {
    this.selectedClient = client;
    this.passwordForm.reset();
    this.viewMode = 'reset_password';
  }

  resetClientPassword(): void {
    if (this.passwordForm.valid && this.selectedClient) {
      this.isLoading = true;
      const newPassword = this.passwordForm.get('mot_de_passe')?.value;
      
      this.clientService.resetPassword(this.selectedClient.id, newPassword).subscribe({
        next: () => {
          this.isLoading = false;
          this.showNotification('Mot de passe réinitialisé avec succès', 'success');
          this.viewMode = 'list';
        },
        error: (error) => {
          this.isLoading = false;
          this.showNotification(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`, 'error');
        }
      });
    }
  }

  cancelPasswordReset(): void {
    this.viewMode = 'list';
    this.passwordForm.reset();
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleShowPasswordConfirm(): void {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'en_attente': return 'En attente';
      case 'suspendu': return 'Suspendu';
      default: return 'Inconnu';
    }
  }

  cancelEdit(): void {
    this.viewMode = 'list';
    this.resetClientForm();
  }

  getActivityIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'appel': return 'call';
      case 'email': return 'email';
      case 'reunion': return 'group';
      case 'note': return 'note';
      default: return 'info';
    }
  }

  getOrderStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'en cours': return 'En cours';
      case 'livré': return 'Livré';
      case 'annulé': return 'Annulé';
      case 'en attente': return 'En attente';
      default: return 'Inconnu';
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'en cours': return 'bg-warning';
      case 'livré': return 'bg-success';
      case 'annulé': return 'bg-danger';
      case 'en attente': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  viewOrderDetails(order: any): void {
    this.router.navigate(['/orders', order.id]);
  }

  printOrderInvoice(order: any): void {
    console.log('Printing invoice for order', order.id);
  }
}