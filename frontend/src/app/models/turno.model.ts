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
}

export interface TurnoRequest {
  dipendenteId: number;
  dataInizio: string;
  oraInizio: string;
  dataFine: string;
  oraFine: string;
  nota?: string;
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