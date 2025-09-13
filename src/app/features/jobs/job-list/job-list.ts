import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  NgxDatatableModule,
  SelectEvent,
  SelectionType,
  TableColumn,
} from '@swimlane/ngx-datatable';

import { Client, HeaderButton, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-job-list',
  imports: [NgxDatatableModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
  standalone: true,
})
export class JobList implements OnInit {
  headerTitle = 'Jobs';
  navigateToAddJob = () => {
    this.router.navigate(['/jobs', 'add']);
  };
  headerButtons: HeaderButton[] = [
    {
      id: 'addJobBtn',
      label: 'Add Job',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: false,
      clickHandler: this.navigateToAddJob,
    },
  ];

  jobs$: Observable<Job[]>;
  clients$: Observable<Client[]>;
  data$: Observable<any[]>;

  jobs: Job[] = [];
  clients: Client[] = [];

  rows: Job[] = [];
  columns: TableColumn[] = [];
  selected: Job[] = [];
  selectionType = SelectionType.single;

  constructor(
    private dataService: DataService,
    private router: Router,
    private pageHeaderService: PageHeaderService
  ) {
    this.jobs$ = this.dataService.load('jobs');
    this.clients$ = this.dataService.load('clients');
    this.data$ = combineLatest([this.jobs$, this.clients$]);

    this.data$.subscribe(([jobs, clients]) => {
      this.clients = clients;
      this.jobs = jobs.map((job: Job) => {
        const clients = this.clients.filter((client) => client.id === job.clientId);
        const clientName = clients.length > 0 ? clients[0].name : '';
        return { ...job, clientName: clientName };
      });
      this.rows = [...this.jobs];
    });
  }

  navigateToJobDetail(id: number) {
    this.router.navigate(['/jobs', id]);
  }

  onSelect({ selected }: SelectEvent<Job>) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.navigateToJobDetail(selected[0].id);
  }

  ngOnInit(): void {
    this.pageHeaderService.send({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
    this.columns = [
      { prop: 'id', name: 'Job Number' },
      { prop: 'clientName', name: 'Client' },
    ];
  }
}
