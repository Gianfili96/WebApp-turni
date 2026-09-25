import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TurniService } from '../../../core/services/turni.service';
import { Turno, Dipendente } from '../../../models/turno.model';

export interface RiepilogoOreDialogData {
  dipendenti: Dipendente[];
  dal: string;
  al: string;
}

interface RiepilogoDipendente {
  dipendente: Dipendente;
  turni: Turno[];
  oreTotali: number;
  minutiTotali: number;
  giorniLavorati: number;
  giorniFerie: number;
  giorniMalattia: number;
  giorniRiposo: number;
}

@Component({
  selector: 'app-riepilogo-ore-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './riepilogo-ore-dialog.html',
  styleUrls: ['./riepilogo-ore-dialog.scss']
})
export class RiepilogoOreDialogComponent implements OnInit {

  private dialogRef = inject(MatDialogRef<RiepilogoOreDialogComponent>);
  data = inject<RiepilogoOreDialogData>(MAT_DIALOG_DATA);
  private turniService = inject(TurniService);
  private cdr = inject(ChangeDetectorRef);

  riepilogo: RiepilogoDipendente[] = [];
  loading = true;

  constructor() {}

  ngOnInit(): void {
    this.turniService.getTurniSettimana(this.data.dal, this.data.al).subscribe({
      next: (turni) => {
        this.riepilogo = this.data.dipendenti.map(dipendente => {
          const turniDipendente = turni.filter(t => t.dipendenteId === dipendente.id);
          return {
            dipendente,
            turni: turniDipendente,
            ...this.calcolaStatistiche(turniDipendente)
          };
        }).filter(r => r.turni.length > 0);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calcolaStatistiche(turni: Turno[]) {
    let minutiTotali = 0;
    let giorniLavorati = 0;
    let giorniFerie = 0;
    let giorniMalattia = 0;
    let giorniRiposo = 0;

    turni.forEach(turno => {
      switch (turno.tipo) {
        case 'TURNO':
          if (turno.oraInizio && turno.oraFine) {
            const [hInizio, mInizio] = turno.oraInizio.split(':').map(Number);
            const [hFine, mFine] = turno.oraFine.split(':').map(Number);
            let minuti = (hFine * 60 + mFine) - (hInizio * 60 + mInizio);
            if (minuti < 0) minuti += 24 * 60;
            minutiTotali += minuti;
          }
          giorniLavorati++;
          break;
        case 'FERIE':    giorniFerie++;    break;
        case 'MALATTIA': giorniMalattia++; break;
        case 'RIPOSO':   giorniRiposo++;   break;
      }
    });

    return {
      oreTotali: Math.floor(minutiTotali / 60),
      minutiTotali: minutiTotali % 60,
      giorniLavorati,
      giorniFerie,
      giorniMalattia,
      giorniRiposo
    };
  }

  formatOre(ore: number, minuti: number): string {
    return `${ore}h ${minuti > 0 ? minuti + 'm' : ''}`.trim();
  }

  getAvatarLetters(dipendente: Dipendente): string {
    return `${dipendente.nome[0]}${dipendente.cognome[0]}`.toUpperCase();
  }

  chiudi(): void {
    this.dialogRef.close();
  }
}