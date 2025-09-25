import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader],
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
        label: '<i class="bi bi-arrow-left"></i> Client list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToClientList,
      },
    ],
  };

  getClientId(): Observable<string> {
    return this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {
    combineLatest([
      this.dataService.clients$,
      this.getClientId(),
      this.dataService.jobs$,
    ]).subscribe(([clients, clientId, jobs]: [Client[], string, Job[]]) => {
      if (clients && clientId && jobs) {
        for (const client of clients) {
          if (client.id === clientId) {
            this.client$ = of(client); // for template
            break;
          }
        }
      }
    });
  }
}
