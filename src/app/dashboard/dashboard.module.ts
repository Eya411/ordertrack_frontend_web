import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardComponent } from './dashboard.component';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
@NgModule({
  declarations: [
    DashboardComponent],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    MatIconModule,
    BaseChartDirective

  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
