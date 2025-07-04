import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommandesRoutingModule } from './commandes-routing.module';
import { CommandeEditComponent } from './Gestion-commandes/commande-edit.component';
@NgModule({
  declarations: [CommandeEditComponent],
  imports: [
    CommonModule,
    CommandesRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CommandesModule { }
