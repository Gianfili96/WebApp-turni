import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-conferma-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './conferma-dialog.html',
  styleUrls: ['./conferma-dialog.scss']
})
export class ConfermaDialogComponent {

  dialogRef = inject(MatDialogRef<ConfermaDialogComponent>);
  data = inject<{ messaggio: string }>(MAT_DIALOG_DATA);

  constructor() {}

  annulla(): void {
    this.dialogRef.close(false);
  }

  conferma(): void {
    this.dialogRef.close(true);
  }
}