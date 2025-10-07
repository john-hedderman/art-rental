import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';

import { Client, HeaderData, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader, RouterLink],
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
        label: 'Client list',
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
    combineLatest({
      clients: this.dataService.clients$,
      clientId: this.getClientId(),
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    })
      .pipe(take(1))
      .subscribe(({ clients, clientId, jobs, sites }) => {
        const client: Client = clients.find((client) => client.id === clientId)!;
        if (client) {
          client.jobs = jobs
            .filter((job) => job.client.id === client.id)
            .map((job: Job) => {
              const site = sites.find((site) => site.id === job.site?.id) ?? ({} as Site);
              return { ...job, site };
            });
          this.client$ = of(client); // for template
        }
      });
  }
}
