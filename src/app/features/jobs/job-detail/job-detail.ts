import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Client, Contact, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Card } from '../../../shared/components/card/card';
import { Util } from '../../../shared/util/util';

@Component({
  selector: 'app-job-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, Card, NgxDatatableModule],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
  standalone: true,
})
export class JobDetail implements OnInit {
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;

  navigateToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Job detail',
    headerButtons: [
      {
        id: 'returnToJobListBtn',
        label: '<i class="bi bi-arrow-left"></i> Job list',
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

  handleArtCardClick = (id: number, event: PointerEvent) => {
    const tgt = event.target as HTMLElement;
    if (tgt.id === 'cardFooter' || tgt.id === 'cardFormCheck' || tgt.id === 'cardCheck') {
      return;
    }
    this.router.navigate(['/art', id]);
  };

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
      jobId: this.getJobId(),
      jobs: this.dataService.jobs$,
    }).subscribe(({ clients, contacts, artwork, jobId, jobs }) => {
      const job: Job | undefined = jobs.find((job) => job.id === jobId);
      if (job) {
        job.client = clients.find((client) => client.id === job.client?.id) ?? ({} as Client);
        job.contacts = contacts
          .filter((contact) => contact.client.id === job.client.id)
          .map((contact: Contact) => {
            const client =
              clients.find((client) => client.id === contact.client.id) ?? ({} as Client);
            return { ...contact, client };
          });
        job.art = artwork.filter((art) => art.job?.id === jobId);
        this.job$ = of(job); // for template
        this.rows = [...job.contacts]; // for table of contacts
      }
    });
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'firstName', name: 'First Name' },
      { prop: 'lastName', name: 'Last Name' },
      { prop: '', name: 'Client', cellTemplate: this.clientNameTemplate },
      { prop: 'phone', name: 'Phone' },
    ];
  }
}
