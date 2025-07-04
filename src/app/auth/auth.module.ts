import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MessageService } from 'primeng/api';
@NgModule({
  declarations: [DashboardComponent, LoginComponent,  RegisterComponent,],
  imports: [
    CommonModule,
    AuthRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    MessageService
  ],
  exports: [LoginComponent, RegisterComponent],
})
export class AuthModule { }
