import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Client, HeaderButton } from '../../../model/models';
import { ClientService } from '../../../service/client-service';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-client-list',
  imports: [],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ClientList implements OnInit {
  headerTitle = 'Clients';

  navigateToAddClient = () => {
    this.router.navigate(['/clients', 'add']);
  };

  headerButtons: HeaderButton[] = [
    {
      id: 'addClientBtn',
      text: 'Add Client',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: false,
      clickHandler: this.navigateToAddClient,
    },
  ];

  clients: Client[] | null = [];

  constructor(
    private clientService: ClientService,
    private router: Router,
    private pageHeaderService: PageHeaderService
  ) {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data;
    });
  }

  navigateToClientDetail(id: number) {
    this.router.navigate(['/clients', id]);
  }

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
