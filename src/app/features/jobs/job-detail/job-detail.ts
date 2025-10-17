import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Art, ClientTest, ContactTest, HeaderData, JobTest, SiteTest } from '../../../model/models';
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

  thumbnail_path = 'images/art/';

  job$: Observable<JobTest> | undefined;
  art$: Observable<Art[]> | undefined;

  rows: ContactTest[] = [];
  columns: TableColumn[] = [];

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  getJobId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    public util: Util
  ) {
    combineLatest({
      clients: this.dataService.clients$,
      contacts: this.dataService.contacts_test$,
      artwork: this.dataService.art$,
      sites: this.dataService.sites_test$,
      jobId: this.getJobId(),
      jobs: this.dataService.jobs_test$,
    })
      .pipe(take(1))
      .subscribe(({ clients, contacts, artwork, sites, jobId, jobs }) => {
        const job = jobs.find((job) => job.job_id === jobId);
        if (job) {
          job.client = clients.find((client) => client.client_id === job.client_id);
          job.contacts = contacts
            .filter((contact) => contact.client_id === job.client_id)
            .map((contact) => {
              const client = clients.find((client) => client.client_id === contact.client_id);
              return { ...contact, client };
            });
          job.art = artwork.filter((art) => art.job_id === jobId);
          this.art$ = of(job.art);
          job.site = sites.find((site) => site.site_id === job.site_id);
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
