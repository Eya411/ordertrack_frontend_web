import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Importation du service manquant
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class UpdatePasswordComponent {
  updateForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  passwordType: string = 'password'; // Initialement masqué
  confirmPasswordType: string = 'password'; // Initialement masqué
  constructor(
    private fb: FormBuilder,
    private authService: AuthService // Service AuthService
  ) {
    this.updateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator.bind(this)]] // Correction de la validation
    });
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.updateForm.invalid) return;

    const { email, password } = this.updateForm.value;
    this.authService.updatePassword({ email, password }).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe mis à jour avec succès.';
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue.';
        this.successMessage = null;
      }
    });
  }

  // Validation pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: { value: string }) {
    if (this.updateForm && control.value !== this.updateForm.get('password')?.value) {
      return { mismatch: true };
    }
    return null;
  }

  // Fonction pour basculer la visibilité du mot de passe
  // Fonction pour basculer la visibilité du mot de passe
  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
      this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
    }
  }
}
