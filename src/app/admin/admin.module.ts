import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SidebarComponent,
    HttpClientModule,
    FormsModule
  ]
})
export class AdminModule { }
