import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';

import { ButtonbarData, Client, Contact, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Constants from '../../../constants';
import * as Messages from '../../../shared/messages';
import { ActionLink, HeaderActions } from '../../../shared/actions/action-data';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, NgxDatatableModule, ContactsTable, Buttonbar],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit, OnDestroy {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;

  goToEditClient = () => this.router.navigate(['/clients', this.clientId, 'edit']);
  goToClientList = () => this.router.navigate(['/clients', 'list']);

  clientListLink = new ActionLink(
    'clientListLink',
    'Clients',
    '/clients/list',
    '',
    this.goToClientList
  );
  headerData = new HeaderActions('client-detail', 'Client detail', [], [this.clientListLink.data]);

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'editClientBtn',
        label: 'Edit',
        type: 'button',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goToEditClient,
      },
      {
        id: 'deleteClientBtn',
        label: 'Delete',
        type: 'button',
        buttonClass: 'btn btn-danger ms-3',
        disabled: false,
        dataBsToggle: 'modal',
        dataBsTarget: '#confirmModal',
        clickHandler: null,
      },
    ],
  };

  client$: Observable<Client> | undefined;
  jobs$: Observable<Job[]> | undefined;

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  contacts: Contact[] = [];
  contactIds: number[] = [];

  clientId = 0;

  clientStatus = '';
  contactsStatus = '';
  readonly OP_SUCCESS = Constants.SUCCESS;
  readonly OP_FAILURE = Constants.FAILURE;

  reloadFromDb() {
    this.dataService
      .load('clients')
      .subscribe((clients) => this.dataService.clients$.next(clients));
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalClientStatus() {
    this.signalStatus(this.clientStatus, Messages.DELETED_CLIENT, Messages.DELETE_CLIENT_FAILED);
  }

  signalContactsStatus(delay?: number) {
    if (this.clientStatus === Constants.SUCCESS) {
      this.signalStatus(
        this.contactsStatus,
        Messages.DELETED_CONTACTS,
        Messages.DELETE_CONTACTS_FAILED,
        delay
      );
    }
  }

  signalResetStatus(delay?: number) {
    if (this.clientStatus === Constants.SUCCESS && this.contactsStatus === Constants.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onClickDelete() {
    this.clientStatus = await this.operationsService.deleteDocument(
      Collections.Clients,
      'client_id',
      this.clientId
    );
    this.contactsStatus = await this.operationsService.deleteDocument(
      Collections.Contacts,
      'client_id',
      this.clientId
    );
    this.signalClientStatus();
    this.signalContactsStatus(1500);
    this.signalResetStatus(1500 * 2);
    if (this.clientStatus === Constants.SUCCESS || this.contactsStatus === Constants.SUCCESS) {
      this.reloadFromDb();
    }
  }

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
    private dataService: DataService,
    private operationsService: OperationsService
  ) {
    combineLatest({
      clients: this.dataService.clients$,
      clientId: this.getClientId(),
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
      contacts: this.dataService.contacts$,
    })
      .pipe(take(1))
      .subscribe(({ clients, clientId, jobs, sites, contacts }) => {
        this.clientId = clientId;
        const client = clients.find((client) => client.client_id === clientId)!;
        if (client) {
          this.contactIds = client.contact_ids;
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

  ngOnDestroy(): void {
    this.signalResetStatus(1500);
  }
}
