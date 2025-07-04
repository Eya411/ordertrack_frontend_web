import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatIconModule,
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    errorMessages: { [key: string]: string } = {};
    minDate: Date;
    maxDate: Date;
    hidePassword: boolean = true;
    hideConfirmPassword: boolean = true;
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        const currentDate = new Date();
        this.maxDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());
        this.minDate = new Date(currentDate.getFullYear() - 100, currentDate.getMonth(), currentDate.getDate());

        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
            ]],
            password_confirmation: ['', Validators.required],
            birthday: ['', Validators.required],
            sexe: ['', Validators.required],
            roleId: ['']
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(form: FormGroup) {
        return form.get('password')?.value === form.get('password_confirmation')?.value
            ? null : { mismatch: true };
    }
    onSubmit(): void {
        if (this.registerForm.invalid) return;
    
        this.isLoading = true;
        this.errorMessages = {};
    
        const formData = this.registerForm.value;
    
        this.authService.register(formData).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/login']); // Redirect to the login page
            },
            error: (err) => {
                this.isLoading = false;
                if (err.error?.errors) {
                    this.errorMessages = err.error.errors;
                } else {
                    this.errorMessages = { general: err.error?.message || 'Registration failed. Please try again.' };
                }
            }
        });
    }
    
    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }
}
