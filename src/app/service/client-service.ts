import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Client } from '../model/models';
import { DataService } from './data-service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  getClient(clientId: string): Observable<Client> {
    let foundClient: Client = {} as Client;
    this.dataService.clients$.subscribe((clients) => {
      if (clients) {
        const filteredClients = clients.filter((client: Client) => {
          return clientId === null ? false : client.id === +clientId;
        });
        foundClient = filteredClients.length ? filteredClients[0] : ({} as Client);
      }
    });
    return of(foundClient);
  }

  constructor(private dataService: DataService) {}
}
