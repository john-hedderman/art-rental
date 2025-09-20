import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Card } from '../../../shared/components/card/card';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, Card, PageHeader],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
  host: {
    class: 'h-100',
  },
})
export class ClientDetail {
  client$: Observable<Client> | undefined;

  navigateToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Client detail',
    headerButtons: [
      {
        id: 'returnToClientListBtn',
        label: '<i class="bi bi-arrow-left"></i> Back',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToClientList,
      },
    ],
  };

  getClientId(): Observable<string> {
    return this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id !== null ? id : '';
      })
    );
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {
    combineLatest([this.dataService.clients$, this.getClientId()]).subscribe(
      ([clients, clientId]) => {
        if (clients && clientId) {
          const matchedClients = clients.filter((client: Client) => client.id === +clientId);
          const matchedClient = matchedClients.length ? matchedClients[0] : ({} as Client);
          this.client$ = of(matchedClient); // for template
        }
      }
    );
  }
}
