import { Component } from '@angular/core';

import { Client } from '../../model/models';
import { ClientService } from '../../service/client-service';

@Component({
  selector: 'app-clients-page',
  imports: [],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
})
export class ClientsPage {
  clients: Client[] = [];

  constructor(private clientService: ClientService) {
    this.clientService.getClientsData().subscribe((data) => {
      this.clients = data;
    });
  }
}
