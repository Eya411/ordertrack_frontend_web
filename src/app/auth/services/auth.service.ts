import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RegisterRequest, User } from '../../models/user';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
    role?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    setTimeout(() => this.initializeAuthState(), 0);
  }

  private initializeAuthState(): void {
    if (this.isBrowser()) {
      const token = this.getToken();
      const user = localStorage.getItem('user');

      console.log('[AuthService] Token dans localStorage:', token);

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          this.currentUserSubject.next(parsedUser);
          this.currentUser.set(parsedUser);
          this.isAuthenticated.set(true);

          this.getUser().subscribe({
            next: () => {},
            error: () => this.clearAuthData() // pour éviter boucle infinie si le token est invalide
          });
           // vérification côté serveur
        } catch {
          this.clearAuthData();
        }
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.storeAuthData(res)),
      switchMap(() => this.getUser()),
      tap(user => {
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.router.navigate(['/dashboard']);
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.storeAuthData(res)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => this.forceLogout()),
      catchError(error => {
        this.forceLogout();
        return throwError(() => error);
      })
    );
  }

  restoreSession(): Observable<User | null> {
    if (!this.isBrowser()) return of(null);
    return this.getUser().pipe(
      tap(user => {
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      }),
      catchError(() => {
        this.forceLogout();
        return of(null);
      })
    );
  }

  getUser(): Observable<User> {
    const headers = this.createAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/user`, { headers });
  }

  updatePassword(data: { email: string; password: string }): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.post(`${this.apiUrl}/update-password`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private storeAuthData(response: AuthResponse): void {
    if (!this.isBrowser()) return;

    const token = response.data.token;
    const user = {
      ...response.data.user,
      role: response.data.role || 'user'
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('[AuthService] Token stocké dans localStorage:', token);

    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private clearAuthData(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  forceLogout(): void {
    this.clearAuthData();
    if (!this.router.url.includes('/login')) {
      this.router.navigate(['/login']);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
    if (error.error?.errors) {
      const messages = Object.values(error.error.errors).flat().join(', ');
      errorMsg = messages;
    } else if (error.error?.message) {
      errorMsg = error.error.message;
    } else if (error.status === 0) {
      errorMsg = 'Erreur réseau ou serveur injoignable.';
    }
    return throwError(() => new Error(errorMsg));
  }

  getToken(): string | null {
    const token = this.isBrowser() ? localStorage.getItem('token') : null;
    console.log('[AuthService] Token récupéré:', token);  // Vérifie le token dans la console
    return token;
  }
  

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.currentUser();
    return user?.role ?? null;
  }

  private isBrowser(): boolean {
    const result = isPlatformBrowser(this.platformId);
    console.log('[AuthService] isBrowser:', result);
    return result;
  }
}
