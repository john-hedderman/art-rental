import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Util } from '../../../shared/util/util';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-job-list',
  imports: [NgxDatatableModule, PageHeader, PageFooter],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class JobList implements OnInit {
  @ViewChild('jobsTable') table!: DatatableComponent<Job>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('clientNameHeaderTemplate', { static: true })
  clientNameHeaderTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressHeaderTemplate', { static: true })
  siteAddressHeaderTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressTemplate', { static: true }) siteAddressTemplate!: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    Util.showHideRowDetail();
  }

  goToAddJob = () => this.router.navigate(['/jobs', 'add']);

  headerData = new HeaderActions('job-list', 'Jobs', [], []);

  addButton = new ActionButton(
    'addBtn',
    'Add Job',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToAddJob
  );
  footerData = new FooterActions([this.addButton]);

  rows: Job[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

  toggleExpandRow(row: Job) {
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
    combineLatest({
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    })
      .pipe(take(1))
      .subscribe(({ clients, jobs, sites }) => {
        const fullJobs = jobs
          .map((job) => {
            const client = clients.find((client) => client.client_id === job.client_id);
            if (client) {
              return { ...job, client };
            }
            return job;
          })
          .map((job) => {
            const site = sites.find((site) => site.site_id === job.site_id);
            if (site) {
              return { ...job, site };
            }
            return job;
          });
        this.rows = [...fullJobs];
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
      { width: 100, prop: 'job_number', name: 'Job Number' },
      {
        width: 200,
        prop: '',
        name: 'Client',
        headerTemplate: this.clientNameHeaderTemplate,
        cellTemplate: this.clientNameTemplate,
      },
      {
        width: 450,
        prop: '',
        name: 'Site',
        headerTemplate: this.siteAddressHeaderTemplate,
        cellTemplate: this.siteAddressTemplate,
        comparator: this.addressComparator,
      },
    ];
  }
}
