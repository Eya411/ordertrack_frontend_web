import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ComptesSecondairesRoutingModule } from './comptes-secondaires-routing.module';
import { CompteListComponent } from './Gestion-comptes-secondaires/compte-list.component';


@NgModule({
  declarations: [CompteListComponent],
  imports: [
    CommonModule,
    ComptesSecondairesRoutingModule,NgbModalModule, CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [CompteListComponent]
})
export class ComptesSecondairesModule { }
