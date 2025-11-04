import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';

import { ButtonbarData, Client, ContactTest, HeaderData, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { SUCCESS, FAILURE } from '../../../shared/constants';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Constants from '../../../shared/constants';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, NgxDatatableModule, ContactsTable, Buttonbar],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit, OnDestroy {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;

  goToEditClient = () => {};
  goToClientList = () => {
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
        clickHandler: this.goToClientList,
      },
    ],
    headerLinks: [],
  };

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

  rows: ContactTest[] = [];
  columns: TableColumn[] = [];

  contacts: ContactTest[] = [];
  contactIds: number[] = [];

  clientId = 0;

  clientStatus = '';
  contactsStatus = '';
  readonly OP_SUCCESS = SUCCESS;
  readonly OP_FAILURE = FAILURE;

  contactsTimeoutId: number | undefined;
  resetTimeoutId: number | undefined;

  updateData() {
    this.dataService
      .load('clients')
      .subscribe((clients) => this.dataService.clients$.next(clients));
    this.dataService
      .load('contacts_test')
      .subscribe((contacts) => this.dataService.contacts_test$.next(contacts));
  }

  signalStatus(status: string, success: string, failure: string) {
    this.operationsService.setStatus({ status, success, failure });
  }

  signalClientStatus() {
    this.signalStatus(this.clientStatus, Constants.CLIENT_SUCCESS, Constants.CLIENT_FAILURE);
  }

  signalContactsStatus() {
    if (this.clientStatus === Constants.SUCCESS) {
      this.contactsTimeoutId = setTimeout(() => {
        this.signalStatus(
          this.contactsStatus,
          Constants.CONTACTS_SUCCESS,
          Constants.CONTACTS_FAILURE
        );
      }, 1500);
    }
  }

  signalResetStatus() {
    if (this.clientStatus === Constants.SUCCESS && this.contactsStatus === Constants.SUCCESS) {
      this.resetTimeoutId = setTimeout(() => {
        this.signalStatus('', '', '');
      }, 3000);
    }
  }

  async onClickDelete() {
    this.clientStatus = await this.deleteClient();
    this.contactsStatus = await this.deleteContacts();
    this.signalClientStatus();
    this.signalContactsStatus();
    this.signalResetStatus();
    if (this.clientStatus === Constants.SUCCESS || this.contactsStatus === Constants.SUCCESS) {
      this.updateData();
    }
  }

  async deleteClient(): Promise<string> {
    const collectionName = Collections.Clients;
    let result = SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(
        collectionName,
        this.clientId,
        'client_id'
      );
      if (returnData.deletedCount === 0) {
        result = FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = FAILURE;
    }
    return result;
  }

  async deleteContacts(): Promise<string> {
    const collectionName = Collections.ContactsTest;
    let result = SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocuments(
        collectionName,
        this.clientId,
        'client_id'
      );
      if (returnData.deletedCount === 0) {
        result = FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = FAILURE;
    }
    return result;
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
      contacts: this.dataService.contacts_test$,
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
    this.signalResetStatus();
    if (this.contactsTimeoutId) {
      clearTimeout(this.contactsTimeoutId);
    }
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
}
