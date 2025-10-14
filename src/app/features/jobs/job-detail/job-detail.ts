import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Client, Contact, HeaderData, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Card } from '../../../shared/components/card/card';
import { Util } from '../../../shared/util/util';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';

@Component({
  selector: 'app-job-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, Card, NgxDatatableModule, ContactsTable],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
  standalone: true,
})
export class JobDetail implements OnInit {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;

  navigateToArtDetail = (id: number) => {
    this.router.navigate(['/art', id]);
  };
  navigateToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Job detail',
    headerButtons: [
      {
        id: 'returnToJobListBtn',
        label: 'Job list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToJobList,
      },
    ],
  };

  job$: Observable<Job> | undefined;

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['firstName']} ${rowA['lastName']}`;
    const nameB = `${rowB['firstName']} ${rowB['lastName']}`;
    return nameA.localeCompare(nameB);
  }

  getJobId(): Observable<string> {
    return this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    public util: Util
  ) {
    combineLatest({
      clients: this.dataService.clients$,
      contacts: this.dataService.contacts$,
      artwork: this.dataService.art$,
      sites: this.dataService.sites$,
      jobId: this.getJobId(),
      jobs: this.dataService.jobs$,
    })
      .pipe(take(1))
      .subscribe(({ clients, contacts, artwork, sites, jobId, jobs }) => {
        const job: Job | undefined = jobs.find((job) => job.id === jobId);
        if (job) {
          job.client =
            clients.find((client) => client.client_id === job.client?.client_id) ?? ({} as Client);
          job.contacts = contacts
            .filter((contact) => contact.client.client_id === job.client.client_id)
            .map((contact: Contact) => {
              const client =
                clients.find((client) => client.client_id === contact.client.client_id) ??
                ({} as Client);
              return { ...contact, client };
            });
          job.art = artwork.filter((art) => art.job?.id === jobId);
          job.site = sites.find((site) => site.id === job.site?.id) ?? ({} as Site);
          this.job$ = of(job); // for template
          this.rows = [...job.contacts]; // for table of contacts
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
