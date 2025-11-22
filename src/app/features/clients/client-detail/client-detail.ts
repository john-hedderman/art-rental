import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Client, Contact, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/components/buttons/delete-button/delete-button';

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

  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditClient
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  client$: Observable<Client> | undefined;
  jobs$: Observable<Job[]> | undefined;

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  contacts: Contact[] = [];
  contactIds: number[] = [];

  clientId = 0;

  clientStatus = '';
  contactsStatus = '';
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  reloadFromDb() {
    this.dataService
      .load('clients')
      .subscribe((clients) => this.dataService.clients$.next(clients));
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  showOpStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  clearOpStatus(status: string, desiredDelay?: number) {
    const delay = status === Const.SUCCESS ? desiredDelay : Const.CLEAR_ERROR_DELAY;
    this.showOpStatus('', '', '', delay);
  }

  async onClickDelete() {
    this.clientStatus = await this.operationsService.deleteDocument(
      Collections.Clients,
      'client_id',
      this.clientId
    );
    this.contactsStatus = await this.deleteContacts();
    this.showOpStatus(this.clientStatus, Msgs.DELETED_CLIENT, Msgs.DELETE_CLIENT_FAILED);
    this.showOpStatus(
      this.contactsStatus,
      Msgs.DELETED_CONTACTS,
      Msgs.DELETE_CONTACTS_FAILED,
      Const.STD_DELAY
    );
    this.clearOpStatus(this.contactsStatus, Const.STD_DELAY * 2);
    this.reloadFromDb();
  }

  async deleteContacts() {
    const collection = Collections.Contacts;
    let returnData;
    let result = Const.SUCCESS;
    try {
      returnData = await this.dataService.deleteDocuments(collection, this.clientId, 'client_id');
      if (returnData.message.indexOf('failed') !== -1) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Error deleting contacts:', error);
      result = Const.FAILURE;
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
      contacts: this.dataService.contacts$,
    })
      .pipe(take(1))
      .subscribe(({ clients, clientId, jobs, sites, contacts }) => {
        this.clientId = clientId;
        const client = clients.find((client) => client.client_id === clientId)!;
        if (client) {
          this.contactIds = client.contact_ids;
          const fullJobs = jobs
            .filter((job) => client.job_ids.indexOf(job.job_id) >= 0)
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
    this.clearOpStatus('');
  }
}
