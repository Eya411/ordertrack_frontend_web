import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule,MatCardModule,MatButtonModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent {
  constructor(public dialogRef: MatDialogRef<TermsComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

}