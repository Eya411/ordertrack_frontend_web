import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { EntrepriseService } from '../../entreprises/services/entreprise.service';
import { CompteSecondaire } from '../../models/comptes-secondaires';
import { Entreprise } from '../../models/entreprises';
import { CompteSecondaireService } from '../service/compte-secondaire.service';

@Component({
    selector: 'app-compte-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './compte-list.component.html',
    styleUrls: ['./compte-list.component.css']
})
export class CompteListComponent implements OnInit {
    comptes: CompteSecondaire[] = [];
    entreprises: Entreprise[] = [];
    compteForm: FormGroup;
    isEditMode = false;
    currentCompteId: number | null = null;
    searchTerm = '';
    selectedRole = '';
    selectedStatut = '';
    showPasswordResetModal = false;
    passwordResetId: number | null = null;
    showAddModal = false;
    newPassword = '';
    errorMessage: string | null = null;
    successMessage: string | null = null;
    passwordConfirmation: string = '';
    showDeleteModal = false;  // Contrôle l'affichage de la modale
    compteIdToDelete: number | null = null;
    constructor(
        private compteService: CompteSecondaireService,
        private entrepriseService: EntrepriseService,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router


    ) {
        this.compteForm = this.createForm();
    }

    ngOnInit(): void {
        const token = this.authService.getToken();
        console.log('[CompteListComponent] Token:', token);

        if (!token) {
            console.warn('Token manquant, tentative de restauration de session...');
            this.authService.restoreSession().subscribe(user => {
                if (user) {
                    this.loadData();
                } else {
                    this.router.navigate(['/login']);
                }
            });
            return;
        }

        this.loadData();
    }
    private createForm(): FormGroup {
        return this.fb.group({
            nom: ['', Validators.required],
            prenom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            password_confirmation: ['', Validators.required], // ✅ ici
            role: ['', Validators.required],
            entreprise_id: ['', Validators.required],
            statut: ['', Validators.required]
        }, { validators: this.passwordMatchValidator.bind(this) });
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirm = control.get('password_confirmation')?.value;

        if (this.isEditMode && !password && !confirm) {
            return null;
        }

        return password === confirm ? null : { mismatch: true };
    }

    private loadData(): void {
        this.loadComptes();
        this.loadEntreprises();
    }

    loadComptes(): void {
        this.compteService.getComptesSecondaires().subscribe({
            next: (data) => {
                this.comptes = data;
            },
            error: (error) => this.handleError('Erreur lors du chargement des comptes', error)
        });
    }

    loadEntreprises(): void {
        this.entrepriseService.getEntreprises().subscribe({
            next: (data) => {
                this.entreprises = data;
            },
            error: (error) => this.handleError('Erreur lors du chargement des entreprises', error)
        });
    }

    onSubmit(): void {
        if (this.compteForm.invalid) {
            console.warn('❌ Formulaire invalide', this.compteForm.value);  // ✅ pour voir ce qui manque
            this.markFormGroupTouched(this.compteForm);
            return;
        }

        const formData = this.prepareFormData();

        if (this.isEditMode && this.currentCompteId) {
            this.updateCompte(formData);
        } else {
            this.createCompte(formData);  // ça appelle ensuite initCSRF
        }
    }

    private prepareFormData(): any {
        const formValue = this.compteForm.value;
        return {
            nom: formValue.nom,
            prenom: formValue.prenom,
            email: formValue.email,
            role: formValue.role,
            entreprise_id: formValue.entreprise_id,
            statut: formValue.statut,
            ...(formValue.password && {
                password: formValue.password,
                ...(!this.isEditMode && { password_confirmation: formValue.password_confirmation })
            })
        };
    }

    private createCompte(formData: any): void {
        console.log('🟡 Données prêtes à envoyer :', formData);

        this.compteService.addCompteSecondaire(formData).subscribe({
            next: (response) => {
                console.log('✅ Compte ajouté !', response);
                this.handleSuccess('Compte ajouté avec succès');
                this.resetForm();
            },
            error: (error) => {
                console.error('❌ Erreur de création', error);
                this.handleError('Erreur lors de l\'ajout du compte', error);
            }
        });
    }


    // Ajoutez une méthode pour vérifier la validité du formulaire
    isFormValid(): boolean {
        console.log('newPassword:', this.newPassword); // Ajoutez des logs pour vérifier les valeurs
        console.log('passwordConfirmation:', this.passwordConfirmation);

        return this.newPassword.length >= 6 && this.passwordConfirmation === this.newPassword;
    }
    private updateCompte(formData: any): void {
        if (!this.currentCompteId) {
            console.error('ID du compte non défini');
            this.showError('Erreur interne : ID du compte manquant');
            return;
        }

        // Exclure les champs 'password' et 'password_confirmation' de formData
        const { password, password_confirmation, ...dataToSend } = formData;

        this.compteService.updateCompteSecondaire(this.currentCompteId, dataToSend).subscribe({
            next: () => {
                this.handleSuccess('Compte mis à jour avec succès');
                this.resetForm();
            },
            error: (error) => {
                console.error('Détails de l\'erreur:', error);
                if (error.status === 422) {
                    const serverErrors = error.error.errors;
                    let errorMessage = 'Erreurs de validation :<br>';
                    for (const field in serverErrors) {
                        errorMessage += `${serverErrors[field].join('<br>')}<br>`;
                    }
                    this.showError(errorMessage);
                } else {
                    this.handleError('Erreur lors de la mise à jour du compte', error);
                }
            }
        });
    }

    editCompte(compte: CompteSecondaire): void {
        this.isEditMode = true;
        this.currentCompteId = compte.id || null;

        // Recrée le formulaire (en mode édition) sans les validateurs obligatoires sur le mot de passe
        this.compteForm = this.fb.group({
            nom: ['', Validators.required],
            prenom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            entreprise_id: ['', Validators.required],
            statut: ['', Validators.required],
            password: ['', [Validators.minLength(6)]],
            password_confirmation: ['']
        }, { validators: this.passwordMatchValidator.bind(this) });

        // 🟡 Remplit les valeurs du formulaire avec les données existantes
        this.compteForm.patchValue({
            nom: compte.nom,
            prenom: compte.prenom,
            email: compte.email,
            role: compte.role,
            entreprise_id: compte.entreprise_id,
            statut: compte.statut
            // on ne préremplit pas password/password_confirmation pour la sécurité
        });

        // Affiche le modal ou formulaire
        this.openAddModal();
    }


    private editPasswordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirm = control.get('password_confirmation')?.value;

        if (password || confirm) {
            return password === confirm ? null : { mismatch: true };
        }
        return null;
    }

    deleteCompte(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            this.compteService.deleteCompteSecondaire(id).subscribe({
                next: () => this.handleSuccess('Compte supprimé avec succès'),
                error: (error) => this.handleError('Erreur lors de la suppression du compte', error)
            });
        }
    }

    private handleSuccess(message: string): void {
        this.loadComptes();
        this.closeAddModal();
        this.showSuccess(message);
    }

    private handleError(defaultMessage: string, error: any): void {
        console.error(defaultMessage, error);
        const errorMessage = error.error?.message ||
            error.error?.error ||
            defaultMessage;
        this.showError(errorMessage);
    }

    resetForm(): void {
        this.compteForm = this.createForm();
        this.isEditMode = false;
        this.currentCompteId = null;
    }

    openPasswordResetModal(id: number): void {
        this.passwordResetId = id;
        this.showPasswordResetModal = true;
        this.newPassword = '';
    }

    closePasswordResetModal(): void {
        this.showPasswordResetModal = false;
        this.passwordResetId = null;
    }
    // CompteListComponent
    resetPassword(): void {
        if (this.isFormValid()) {
            const resetData = {
                password: this.newPassword,  // Nouveau mot de passe
                password_confirmation: this.passwordConfirmation // Confirmation du mot de passe
            };

            this.compteService.resetPassword(this.passwordResetId, resetData).subscribe({
                next: () => {
                    this.showSuccess('Mot de passe réinitialisé avec succès');
                    this.closePasswordResetModal();
                },
                error: (error) => this.handleError('Erreur lors de la réinitialisation du mot de passe', error)
            });
        } else {
            console.error("Les mots de passe ne correspondent pas ou sont trop courts");
        }
    }





    openAddModal(): void {
        if (!this.isEditMode) {
            this.resetForm();
        }
        this.showAddModal = true;
        this.errorMessage = null;
        this.successMessage = null;
    }

    closeAddModal(): void {
        this.showAddModal = false;
    }

    getStatutText(statut: string): string {
        switch (statut) {
            case 'actif': return 'Actif';
            case 'inactif': return 'Inactif';
            case 'en_attente': return 'En attente';
            case 'bloque': return 'Bloqué';
            default: return statut;
        }
    }

    get filteredComptes(): CompteSecondaire[] {
        return this.comptes.filter(compte => {
            const matchesSearch = compte.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                compte.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                compte.email.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesRole = this.selectedRole ? compte.role === this.selectedRole : true;
            const matchesStatut = this.selectedStatut ? compte.statut === this.selectedStatut : true;

            return matchesSearch && matchesRole && matchesStatut;
        });
    }

    getEntrepriseName(id: number): string {
        const entreprise = this.entreprises.find(e => e.id === id);
        return entreprise ? entreprise.nom : 'Inconnue';
    }

    private showError(message: string): void {
        this.errorMessage = message;
        setTimeout(() => this.errorMessage = null, 5000);
    }

    private showSuccess(message: string): void {
        this.successMessage = message;
        setTimeout(() => this.successMessage = null, 5000);
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    trackById(index: number, item: CompteSecondaire): number {
        return item.id!;
    }

      // Ouvre la modale de confirmation de suppression
      openDeleteModal(compteId: number): void {
        this.compteIdToDelete = compteId;
        this.showDeleteModal = true;
    }

    // Ferme la modale de suppression
    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.compteIdToDelete = null;
    }

    // Confirme la suppression du compte
    confirmDelete(): void {
        if (this.compteIdToDelete) {
            this.compteService.deleteCompteSecondaire(this.compteIdToDelete).subscribe({
                next: () => {
                    this.handleSuccess('Compte supprimé avec succès');
                    this.closeDeleteModal();
                    this.loadComptes(); // Recharge les comptes après la suppression
                },
                error: (error) => this.handleError('Erreur lors de la suppression du compte', error)
            });
        }
    }



}
