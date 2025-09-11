import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../model/models';
import { DataService } from './data-service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private dataService: DataService) {}

  getClient(clientId: string): Observable<Client> {
    return this.dataService.load('clients').pipe(
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
