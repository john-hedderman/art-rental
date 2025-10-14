import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Client, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Util } from '../../../shared/util/util';

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
  @ViewChild('jobsTable') table!: DatatableComponent<Client>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('clientNameHeaderTemplate', { static: true })
  clientNameHeaderTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('jobAddressHeaderTemplate', { static: true })
  jobAddressHeaderTemplate!: TemplateRef<any>;
  @ViewChild('jobAddressTemplate', { static: true }) jobAddressTemplate!: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    Util.showHideRowDetail();
  }

  navigateToAddJob = () => {
    this.router.navigate(['/jobs', 'add']);
  };
  headerData: HeaderData = {
    headerTitle: 'Jobs',
    headerButtons: [
      {
        id: 'addJobBtn',
        label: 'Add Job',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToAddJob,
      },
    ],
  };

  rows: Job[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

  toggleExpandRow(row: Client) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/jobs', event.row.job_id]);
    }
  }

  addressComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['address1']}, ${rowA['city']}, ${rowA['state']} ${rowA['zip_code']}`;
    const locationB = `${rowB['address1']}, ${rowB['city']}, ${rowB['state']} ${rowB['zip_code']}`;
    return locationA.localeCompare(locationB);
  }

  constructor(private dataService: DataService, private router: Router) {
    combineLatest({ clients: this.dataService.clients$, jobs: this.dataService.jobs$ })
      .pipe(take(1))
      .subscribe(({ clients, jobs }) => {
        if (clients && jobs) {
          const jobsWithClients = jobs.map((job: Job) => {
            const client = clients.find((client) => client.client_id === job.client?.client_id)!;
            return { ...job, client };
          });
          this.rows = [...jobsWithClients];
        }
      });
  }

  ngOnInit(): void {
    this.columns = [
      {
        width: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        canAutoResize: false,
        cellTemplate: this.arrowTemplate,
      },
      { width: 200, prop: 'job_id', name: 'Job Number' },
      {
        width: 300,
        prop: '',
        name: 'Client',
        headerTemplate: this.clientNameHeaderTemplate,
        cellTemplate: this.clientNameTemplate,
      },
      {
        width: 400,
        prop: '',
        name: 'Address',
        headerTemplate: this.jobAddressHeaderTemplate,
        cellTemplate: this.jobAddressTemplate,
        comparator: this.addressComparator,
      },
    ];
  }
}
