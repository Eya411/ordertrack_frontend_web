// 🔧 Composant AdminListComponent aligné avec le backend Laravel (AdminController)
// Corrigé pour respecter la structure de réponse Laravel + gestion complète des erreurs

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { Admin } from '../../models/admin';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  admins: Admin[] = [];
  roles: string[] = [];
  statuses: string[] = [];
  isAddingAdmin = false;

  filteredAdmins: Admin[] = [];
  searchNom = '';
  selectedRole = '';
  selectedStatut = '';

  admin: Admin = this.getDefaultAdmin();
  selectedAdmin: Admin | null = null;
  passwordConfirm = '';
  newPassword = '';
  newPasswordConfirm = '';
  showPasswordMap: { [adminId: number]: boolean } = {};
  showPasswordField: boolean = false;

  loading = false;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';
  showAddAdminForm = false;
  showUpdateForm = false;
  showConfirmationDialog = false;
  adminToDelete: Admin | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.getAdmins();
    this.getRoles();
    this.getStatuses();
  }

  private getDefaultAdmin(): Admin {
    return {
      nom: '',
      email: '',
      password: '',
      role: '',
      statut: 'Actif'
    };
  }

  getAdmins(): void {
    this.loading = true;
    this.adminService.getAdmins().subscribe({
      next: res => {
        this.admins = res.data || [];
        this.filteredAdmins = [...this.admins];
      },
      error: err => this.errorMessage = 'Erreur chargement administrateurs',
      complete: () => this.loading = false
    });
  }

  getRoles(): void {
    this.adminService.getRoles().subscribe({
      next: res => this.roles = res.data || [],
      error: () => this.roles = ['Administrateur', 'Gestionnaire de Comptes', 'Modérateur', 'Chargé Marketing']
    });
  }

  getStatuses(): void {
    this.adminService.getStatuses().subscribe({
      next: res => this.statuses = res.data || [],
      error: () => this.statuses = ['Actif', 'Inactif', 'En attente', 'Suspendu', 'Supprimé']
    });
  }

  filterAdmins(): void {
    this.filteredAdmins = this.admins.filter(admin =>
      (!this.searchNom || admin.nom.toLowerCase().includes(this.searchNom.toLowerCase())) &&
      (!this.selectedRole || admin.role === this.selectedRole) &&
      (!this.selectedStatut || admin.statut === this.selectedStatut)
    );
  }

  resetFilters(): void {
    this.searchNom = '';
    this.selectedRole = '';
    this.selectedStatut = '';
    this.filterAdmins();
  }

  openAddAdminForm(): void {
    this.admin = this.getDefaultAdmin();
    this.passwordConfirm = '';
    this.errorMessage = '';
    this.showAddAdminForm = true;
  }

  closeAddAdminForm(): void {
    this.showAddAdminForm = false;
  }

  addAdmin(): void {
    if (this.admin.password !== this.passwordConfirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isProcessing = true;
    this.adminService.addAdmin({
      ...this.admin,
      password_confirmation: this.passwordConfirm
    }).subscribe({
      next: res => {
        if (res.success) {
          this.getAdmins();
          this.showSuccessMessage('Administrateur ajouté avec succès');
          this.showAddAdminForm = false;
        } else {
          this.errorMessage = res.message || 'Erreur lors de l\'ajout';
        }
      },
      error: err => this.handleError(err, 'Erreur lors de l\'ajout'),
      complete: () => this.isProcessing = false
    });
  }

  openUpdateForm(admin: Admin): void {
    this.selectedAdmin = { ...admin };
    this.newPassword = '';
    this.newPasswordConfirm = '';
    this.showUpdateForm = true;
  }

  cancelUpdate(): void {
    this.showUpdateForm = false;
  }

  updateAdmin(): void {
    if (!this.selectedAdmin) return;

    const updateData: any = {
      nom: this.selectedAdmin.nom,
      email: this.selectedAdmin.email,
      role: this.selectedAdmin.role,
      statut: this.selectedAdmin.statut
    };

    if (this.newPassword) {
      if (this.newPassword !== this.newPasswordConfirm) {
        this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas';
        return;
      }
      updateData.password = this.newPassword;
      updateData.password_confirmation = this.newPasswordConfirm;
    }

    this.isProcessing = true;
    this.adminService.updateAdmin(this.selectedAdmin.id!, updateData).subscribe({
      next: res => {
        if (res.success) {
          this.getAdmins();
          this.showSuccessMessage('Administrateur mis à jour avec succès');
          this.showUpdateForm = false;
        } else {
          this.errorMessage = res.message || 'Erreur mise à jour';
        }
      },
      error: err => this.handleError(err, 'Erreur mise à jour'),
      complete: () => this.isProcessing = false
    });
  }

  confirmDelete(admin: Admin): void {
    this.adminToDelete = admin;
    this.showConfirmationDialog = true;
  }

  deleteAdmin(): void {
    if (!this.adminToDelete) return;
    this.isProcessing = true;
    this.adminService.deleteAdmin(this.adminToDelete.id!).subscribe({
      next: res => {
        this.getAdmins();
        this.showSuccessMessage('Administrateur supprimé');
        this.closeConfirmationDialog();
      },
      error: err => this.handleError(err, 'Erreur suppression'),
      complete: () => this.isProcessing = false
    });
  }

  restoreAdmin(admin: Admin): void {
    this.isProcessing = true;
    this.adminService.restoreAdmin(admin.id!).subscribe({
      next: res => {
        this.getAdmins();
        this.showSuccessMessage('Administrateur restauré');
      },
      error: err => this.handleError(err, 'Erreur restauration'),
      complete: () => this.isProcessing = false
    });
  }

  permanentDelete(admin: Admin): void {
    this.adminService.deleteAdminDefinitively(admin.id).subscribe(() => {
      this.getAdmins();
    });
  }

  closeConfirmationDialog(): void {
    this.showConfirmationDialog = false;
    this.adminToDelete = null;
    this.errorMessage = '';
  }

  private showSuccessMessage(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  trackByAdminId(index: number, admin: Admin): number {
    return admin.id;
  }

  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
  }

  togglePassword(adminId: number): void {
    this.showPasswordMap[adminId] = !this.showPasswordMap[adminId];
  }

  showPasswordConfirm: boolean = false;
  toggleShowPasswordConfirm(): void {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }
  showNewPassword: boolean = false;
  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  showNewPasswordConfirm: boolean = false;
  toggleShowNewPasswordConfirm(): void {
    this.showNewPasswordConfirm = !this.showNewPasswordConfirm;
  }

  private handleError(error: any, defaultMsg: string): void {
    if (error.error?.errors) {
      const messages = Object.values(error.error.errors).flat().join(', ');
      this.errorMessage = messages;
    } else {
      this.errorMessage = error.error?.message || defaultMsg;
    }
  }
}