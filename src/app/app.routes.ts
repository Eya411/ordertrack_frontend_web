import { Routes } from '@angular/router';

// Composants publics
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { TermsComponent } from './auth/terms/terms.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './shared/unauthorized/unauthorized.component';

// Composants protégés
import { AdminListComponent } from './admin/admin-list/admin-list.component';
import { AuthGuard } from './auth/auth.guard';
import { UpdatePasswordComponent } from './auth/update-password/update-password.component';
import { ClientFormComponent } from './clients/Gestion-clients/client-form.component';
import { CommandeEditComponent } from './commandes/Gestion-commandes/commande-edit.component';
import { CompteListComponent } from './comptes-secondaires/Gestion-comptes-secondaires/compte-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntrepriseFormComponent } from './entreprises/Gestion-entreprises/entreprise-form.component';
import { MessageFormComponent } from './messagerie/messagerie/message-form.component';

export const routes: Routes = [
    // ✅ Routes publiques
    { path: 'login', component: LoginComponent, data: { title: 'Connexion', hideSidebar: true, public: true } },
    { path: 'register', component: RegisterComponent, data: { title: 'Inscription', hideSidebar: true, public: true } },
    { path: 'terms', component: TermsComponent, data: { title: 'Conditions Générales', hideSidebar: true } },
    { path: 'terms', component: TermsComponent, data: { title: 'Conditions Générales', hideSidebar: true } },
    { path: 'update-password', component: UpdatePasswordComponent, data: { title: 'Mise a jour mdp', hideSidebar: true } },

    // ✅ Routes protégées
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { title: 'Tableau de bord' } },
    { path: 'admin', component: AdminListComponent, canActivate: [AuthGuard], data: { title: 'Administrateurs' } },
    { path: 'entreprises', component: EntrepriseFormComponent, canActivate: [AuthGuard], data: { title: 'Entreprises' } },
    { path: 'comptes-secondaires', component: CompteListComponent, canActivate: [AuthGuard], data: { title: 'Comptes Secondaires' } },
    { path: 'clients', component: ClientFormComponent, canActivate: [AuthGuard], data: { title: 'Clients' } },
    { path: 'commandes', component: CommandeEditComponent, canActivate: [AuthGuard], data: { title: 'Commandes' } },
    { path: 'messages', component: MessageFormComponent, canActivate: [AuthGuard], data: { title: 'Messagerie' } },

    // ❌ Page 404
    { path: '404', component: NotFoundComponent, data: { title: 'Page non trouvée' } },
    { path: '**', redirectTo: '404', pathMatch: 'full' },
    { path: 'unauthorized', component: UnauthorizedComponent }

];
