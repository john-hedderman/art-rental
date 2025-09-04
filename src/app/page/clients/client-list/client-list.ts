import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Client } from '../../../model/models';
import { ClientService } from '../../../service/client-service';

@Component({
  selector: 'app-client-list',
  imports: [],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
})
export class ClientList {
  clients: Client[] = [];

  constructor(private clientService: ClientService, private router: Router) {
    this.clientService.getClientsData().subscribe((data) => {
      this.clients = data;
    });
  }

  goToClientDetail(id: number) {
    this.router.navigate(['/clients', id]);
  }
}
