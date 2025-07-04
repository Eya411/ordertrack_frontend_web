import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PrivacyComponent } from '../privacy/privacy.component';
import { AuthService } from '../services/auth.service';
import { TermsComponent } from '../terms/terms.component';
@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [
        ReactiveFormsModule,
        CommonModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatIconModule
    ]
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = null;

        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: (user) => {
                this.isLoading = false;
                if (user) {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.errorMessage = 'Authentification échouée';
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = this.getErrorMessage(err);
            }
        });
    }

    navigateToRegister(): void {
        // Ajout d'un timeout pour éviter les conflits avec les requêtes en cours
        setTimeout(() => {
            this.router.navigate(['/register']);
        }, 100);
    }
    navigateToForgotPassword(): void {
        setTimeout(() => {
            this.router.navigate(['/update-password']);
        }, 100);
    }

    private getErrorMessage(error: any): string {
        if (error.error?.message) {
            return error.error.message;
        }
        if (error.status === 401) {
            return 'Email ou mot de passe incorrect';
        }
        if (error.status === 0) {
            return 'Erreur de connexion au serveur';
        }
        return error.message || 'Une erreur est survenue';
    }

    openPrivacy(): void {
        this.dialog.open(PrivacyComponent, {
            width: '800px',
            maxHeight: '90vh'
        });
    }

    openTerms(): void {
        this.dialog.open(TermsComponent, {
            width: '800px',
            maxHeight: '90vh'
        });
    }
}