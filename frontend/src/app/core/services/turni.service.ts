import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turno, TurnoRequest } from '../../models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurniService {

  private readonly API_URL = 'http://localhost:8080/api/turni';

  constructor(private http: HttpClient) {}

    creaTurniMultipli(turni: TurnoRequest[]): Observable<Turno[]> {
    return this.http.post<Turno[]>(`${this.API_URL}/multipli`, turni);
  }

  getTurniSettimana(dal: string, al: string): Observable<Turno[]> {
    const params = new HttpParams().set('dal', dal).set('al', al);
    return this.http.get<Turno[]>(this.API_URL, { params });
  }

  getTurniDipendente(dipendenteId: number, dal: string, al: string): Observable<Turno[]> {
    const params = new HttpParams().set('dal', dal).set('al', al);
    return this.http.get<Turno[]>(`${this.API_URL}/dipendente/${dipendenteId}`, { params });
  }

  creaTurno(turno: TurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.API_URL, turno);
  }

  modificaTurno(id: number, turno: TurnoRequest): Observable<Turno> {
    return this.http.put<Turno>(`${this.API_URL}/${id}`, turno);
  }

  eliminaTurno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}