import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Client, HeaderButton } from '../../../model/models';
import { ClientService } from '../../../service/client-service';
import { PageHeader } from '../../../components/page-header/page-header';

@Component({
  selector: 'app-client-list',
  imports: [PageHeader],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ClientList {
  headerTitle = 'Clients';

  navigateToAddClient = () => {
    this.router.navigate(['/clients', 'add']);
  };

  headerButtons: HeaderButton[] = [
    {
      text: 'Add Client',
      type: 'button',
      buttonClass: 'btn btn-primary',
      clickHandler: this.navigateToAddClient,
    },
  ];

  clients: Client[] = [];

  constructor(private clientService: ClientService, private router: Router) {
    this.clientService.getClientsData().subscribe((data) => {
      this.clients = data;
    });
  }

  navigateToClientDetail(id: number) {
    this.router.navigate(['/clients', id]);
  }
}
