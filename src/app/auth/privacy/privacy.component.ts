import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule,MatCardModule,MatButtonModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent {
  constructor(public dialogRef: MatDialogRef<PrivacyComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  
}