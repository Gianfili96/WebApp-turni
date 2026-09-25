import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Dipendente } from '../../../models/turno.model';

export interface NotificaDialogData {
  reparto: string;
  repartoLabel: string;
  dipendenti: Dipendente[];
}

export interface NotificaDialogResult {
  confermato: boolean;
  tuttiSelezionati: boolean;
  dipendentiSelezionati: number[];
}

@Component({
  selector: 'app-notifica-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './notifica-dialog.html',
  styleUrls: ['./notifica-dialog.scss']
})
export class NotificaDialogComponent implements OnInit {

  private dialogRef = inject(MatDialogRef<NotificaDialogComponent>);
  data = inject<NotificaDialogData>(MAT_DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  dipendentiSelezionati: { [id: number]: boolean } = {};
  tuttiSelezionati = true;

  constructor() {}

  ngOnInit(): void {
    this.data.dipendenti.forEach(d => {
      this.dipendentiSelezionati[d.id] = true;
    });
  }

  toggleTutti(): void {
    this.tuttiSelezionati = !this.tuttiSelezionati;
    this.data.dipendenti.forEach(d => {
      this.dipendentiSelezionati[d.id] = this.tuttiSelezionati;
    });
    this.cdr.detectChanges();
  }

  toggleDipendente(id: number): void {
    this.dipendentiSelezionati[id] = !this.dipendentiSelezionati[id];
    this.tuttiSelezionati = this.data.dipendenti.every(d => this.dipendentiSelezionati[d.id]);
    this.cdr.detectChanges();
  }

  getSelezionatiCount(): number {
    return Object.values(this.dipendentiSelezionati).filter(v => v).length;
  }

  getIdSelezionati(): number[] {
    return Object.entries(this.dipendentiSelezionati)
      .filter(([_, v]) => v)
      .map(([id, _]) => Number(id));
  }

  annulla(): void {
    this.dialogRef.close({ confermato: false });
  }

  conferma(): void {
    this.dialogRef.close({
      confermato: true,
      tuttiSelezionati: this.tuttiSelezionati,
      dipendentiSelezionati: this.getIdSelezionati()
    });
  }
}