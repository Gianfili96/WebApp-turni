export type TipoTurno = 'TURNO' | 'FERIE' | 'MALATTIA' | 'RIPOSO';

// turno.model.ts
export interface Turno {
  id: number;
  dipendenteId: number;
  dipendenteNome: string;
  dipendenteCognome: string;
  dataInizio: string;
  oraInizio: string;
  dataFine: string;
  oraFine: string;
  nota?: string;
  tipo: TipoTurno;
}

export interface TurnoRequest {
  dipendenteId: number;
  dataInizio: string;
  oraInizio: string;
  dataFine: string;
  oraFine: string;
  nota?: string;
  tipo: TipoTurno;
}

// dipendente.model.ts
export interface Dipendente {
  id: number;
  nome: string;
  cognome: string;
  telefono?: string;
  email: string;
  attivo: boolean;
}