// user.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  dipendenteId: number;
  nome: string;
  email: string;
  ruolo: 'RESPONSABILE' | 'ADDETTO';
}

export interface UserSession {
  token: string;
  userId: number;
  dipendenteId: number;
  nome: string;
  email: string;
  ruolo: 'RESPONSABILE' | 'ADDETTO';
}