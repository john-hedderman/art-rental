import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('jobAddressTemplate', { static: true }) jobAddressTemplate!: TemplateRef<any>;

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

  navigateToJobDetail(id: string) {
    this.router.navigate(['/jobs', id]);
  }

  onSelect({ selected }: SelectEvent<Job>) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.navigateToJobDetail(selected[0].id);
  }

  addressComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['address1']}, ${rowA['city']}, ${rowA['state']} ${rowA['zipCode']}`;
    const locationB = `${rowB['address1']}, ${rowB['city']}, ${rowB['state']} ${rowB['zipCode']}`;
    return locationA.localeCompare(locationB);
  }

  constructor(private dataService: DataService, private router: Router) {
    combineLatest([this.dataService.clients$, this.dataService.jobs$]).subscribe(
      ([clients, jobs]) => {
        if (clients && jobs) {
          this.clients = clients;
          this.jobs = jobs.map((job: Job) => {
            const client = clients.find((client) => client.id === job.client?.id)!;
            // ensure client information is fleshed out
            return { ...job, client };
          });
          this.rows = [...this.jobs];
        }
      }
    );
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'id', name: 'Job Number' },
      { prop: '', name: 'Client', cellTemplate: this.clientNameTemplate },
      {
        prop: '',
        name: 'Address',
        cellTemplate: this.jobAddressTemplate,
        comparator: this.addressComparator,
      },
    ];
  }
}
