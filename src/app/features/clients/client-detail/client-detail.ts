import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';

import { Client, ContactTest, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, NgxDatatableModule, ContactsTable],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;

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

  client$: Observable<Client> | undefined;
  jobs$: Observable<Job[]> | undefined;

  rows: ContactTest[] = [];
  columns: TableColumn[] = [];

  contacts: ContactTest[] = [];

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  getClientId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
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
      contacts: this.dataService.contacts_test$,
    })
      .pipe(take(1))
      .subscribe(({ clients, clientId, jobs, sites, contacts }) => {
        const client = clients.find((client) => client.client_id === clientId)!;
        if (client) {
          const fullJobs = jobs
            .filter((job) => {
              return client.job_ids.indexOf(job.job_id) >= 0;
            })
            .map((job) => {
              const site = sites.find((site) => site.site_id === job.site_id);
              return { ...job, site };
            });
          this.jobs$ = of(fullJobs);
          this.contacts = contacts.filter((contact) => {
            return client.contact_ids.indexOf(contact.contact_id) >= 0;
          });
          this.client$ = of(client); // for template
          this.rows = [...this.contacts]; // for table of contacts
        }
      });
  }

  ngOnInit(): void {
    this.columns = [
      {
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator,
      },
      {
        prop: 'title',
        name: 'Title',
      },
      {
        prop: 'phone',
        name: 'Phone',
      },
    ];
  }
}
