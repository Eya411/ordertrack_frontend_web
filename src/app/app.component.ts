import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/services/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent,],
  template: `
    <div class="app-container">
      <app-sidebar *ngIf="showSidebar()" />

      <main class="content-area" [class.with-sidebar]="showSidebar()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .content-area {
      flex: 1;
      padding: 20px;
      transition: margin-left 0.3s ease;
    }

    .content-area.with-sidebar {
      margin-left: 250px;
    }

    @media (max-width: 768px) {
      .content-area.with-sidebar {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated; // ✅ Utilise directement le signal du service

  showSidebar = computed(() => {
    const isAuth = this.authService.isAuthenticated();
    const isAuthPage = this.isAuthPage();
    return isAuth && !isAuthPage;
  });

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        setTimeout(() => {
          this.authService.restoreSession();
        }, 100); // ✅ Force un check après navigation
      });
  }

  ngOnInit(): void {
    this.authService.restoreSession();
    setTimeout(() => {
      this.authService.isAuthenticated.set(this.authService.isLoggedIn());
    }, 300);
  }

  private isAuthPage(): boolean {
    return ['/login', '/register', '/update-password', '/forgot-password']
      .some(path => this.router.url.startsWith(path));
  }
}
