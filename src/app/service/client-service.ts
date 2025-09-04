import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Client } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private clientDataUrl = 'assets/clients.json';

  constructor(private http: HttpClient) {}

  getClientsData(): Observable<Client[]> {
    return this.http.get<Client[]>(this.clientDataUrl);
  }
}
