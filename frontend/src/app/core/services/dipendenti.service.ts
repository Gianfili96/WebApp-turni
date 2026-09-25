import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dipendente } from '../../models/turno.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DipendentiService {

  private readonly API_URL = `${environment.apiUrl}/dipendenti`;

  constructor(private http: HttpClient) {}

  getTutti(): Observable<Dipendente[]> {
    return this.http.get<Dipendente[]>(this.API_URL);
  }

  getById(id: number): Observable<Dipendente> {
    return this.http.get<Dipendente>(`${this.API_URL}/${id}`);
  }

  registra(dipendente: any): Observable<Dipendente> {
  return this.http.post<Dipendente>(this.API_URL, dipendente);
  }

  modifica(id: number, dipendente: any): Observable<Dipendente> {
  return this.http.put<Dipendente>(`${this.API_URL}/${id}`, dipendente);
  }

  elimina(id: number): Observable<void> {
  return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}