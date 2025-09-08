import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private clientDataUrl = 'assets/clients.json';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.clientDataUrl);
  }

  getClient(clientId: string): Observable<Client> {
    return this.getClients().pipe(
      map((clients) =>
        clients.filter((client) => {
          return clientId === null ? false : client.id === +clientId;
        })
      ),
      map((clients) => {
        return clients.length ? clients[0] : ({} as Client);
      })
    );
  }
}
