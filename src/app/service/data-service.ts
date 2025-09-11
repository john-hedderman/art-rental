import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Art, Artist, Client } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  load(data: 'art'): Observable<Art[]>;
  load(data: 'artists'): Observable<Artist[]>;
  load(data: 'clients'): Observable<Client[]>;

  load(data: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`assets/data/${data}.json`);
  }
}
