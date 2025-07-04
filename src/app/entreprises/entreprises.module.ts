import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants
import { EntrepriseFormComponent } from './Gestion-entreprises/entreprise-form.component';
// import { HistoriqueEntrepriseComponent } from './historique-entreprise/historique-entreprise.component';

// Modules
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EntreprisesRoutingModule } from './entreprises-routing.module';
@NgModule({
  declarations: [
    EntrepriseFormComponent,
    // HistoriqueEntrepriseComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    EntreprisesRoutingModule,SidebarComponent,

  ],
  exports: [
    EntrepriseFormComponent,  // ✅ Ajout pour intégration avec Dashboard
    // HistoriqueEntrepriseComponent
  ]
})
export class EntreprisesModule { }
