import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import {
  NgxDatatableModule,
  SelectEvent,
  SelectionType,
  TableColumn,
} from '@swimlane/ngx-datatable';

import { Client, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-job-list',
  imports: [NgxDatatableModule, PageHeader],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class JobList implements OnInit {
  navigateToAddJob = () => {
    this.router.navigate(['/jobs', 'add']);
  };
  headerData: HeaderData = {
    headerTitle: 'Jobs',
    headerButtons: [
      {
        id: 'addJobBtn',
        label: 'New Job',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToAddJob,
      },
    ],
  };

  jobs: Job[] = [];
  clients: Client[] = [];

  rows: Job[] = [];
  columns: TableColumn[] = [];
  selected: Job[] = [];
  selectionType = SelectionType.single;

  navigateToJobDetail(id: number) {
    this.router.navigate(['/jobs', id]);
  }

  onSelect({ selected }: SelectEvent<Job>) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.navigateToJobDetail(selected[0].id);
  }

  constructor(private dataService: DataService, private router: Router) {
    combineLatest([this.dataService.clients$, this.dataService.jobs$]).subscribe(
      ([clients, jobs]) => {
        if (clients && jobs) {
          this.clients = clients;
          this.jobs = jobs.map((job: Job) => {
            const clients = this.clients.filter((client) => client.id === job.clientId);
            const clientName = clients.length ? clients[0].name : '';
            return { ...job, clientName: clientName };
          });
          this.rows = [...this.jobs];
        }
      }
    );
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'id', name: 'Job Number' },
      { prop: 'clientName', name: 'Client' },
    ];
  }
}
