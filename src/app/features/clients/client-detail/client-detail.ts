import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Client, Contact, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/components/buttons/delete-button/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, NgxDatatableModule, ContactsTable, PageFooter],
  providers: [MessagesService],
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
  sites$: Observable<Site[]> | undefined;

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  contacts: Contact[] = [];
  contactIds: number[] = [];

  clientId = 0;

  clientStatus = '';
  contactsStatus = '';
  sitesStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  async onClickDelete() {
    this.clientStatus = await this.operationsService.deleteDocument(
      Collections.Clients,
      'client_id',
      this.clientId
    );
    this.contactsStatus = await this.operationsService.deleteDocuments(
      Collections.Contacts,
      'client_id',
      this.clientId
    );
    this.sitesStatus = await this.operationsService.deleteDocuments(
      Collections.Sites,
      'client_id',
      this.clientId
    );
    this.messagesService.showStatus(
      this.clientStatus,
      Msgs.DELETED_CLIENT,
      Msgs.DELETE_CLIENT_FAILED
    );
    this.messagesService.showStatus(
      this.contactsStatus,
      Msgs.DELETED_CONTACTS,
      Msgs.DELETE_CONTACTS_FAILED
    );
    this.messagesService.showStatus(this.sitesStatus, Msgs.DELETED_SITES, Msgs.DELETE_SITES_FAILED);
    this.messagesService.clearStatus();
    this.dataService.reloadData(['clients', 'contacts', 'sites'], this.goToClientList);
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
    private operationsService: OperationsService,
    private messagesService: MessagesService
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
          this.contacts = contacts
            .filter((contact) => {
              return client.contact_ids.indexOf(contact.contact_id) >= 0;
            })
            .map((contact) => {
              const client = clients.find((client) => client.client_id === contact.client_id);
              return { ...contact, client };
            });
          this.client$ = of(client);
          const clientSites = sites.filter((site) => site.client_id === this.clientId);
          this.sites$ = of(clientSites);
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
    this.messagesService.clearStatus();
  }
}
