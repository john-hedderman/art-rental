import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, distinctUntilChanged, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { IClient, IContact, IJob, ISite } from '../../../model/models';
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
  HeaderActions
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { Util } from '../../../shared/util/util';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';

@Component({
  selector: 'app-client-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, NgxDatatableModule, ContactsTable, PageFooter],
  providers: [MessagesService],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true
})
export class ClientDetail extends DetailBase implements OnInit, OnDestroy {
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

  client: IClient | undefined;

  client$: Observable<IClient> | undefined;
  jobs$: Observable<IJob[]> | undefined;
  sites$: Observable<ISite[]> | undefined;

  rows: IContact[] = [];
  columns: TableColumn[] = [];

  contacts: IContact[] = [];
  contactIds: number[] = [];

  clientId = 0;

  deleteStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  SITE_TBD_NAME = Const.SITE_TBD_NAME;

  private readonly destroy$ = new Subject<void>();

  override preDelete(): void {}

  override async delete(): Promise<string> {
    const clientStatus = await this.deleteClient();
    const contactsStatus = await this.deleteContacts();
    const sitesStatus = await this.deleteSites();
    return this.jobResult([clientStatus, contactsStatus, sitesStatus]);
  }

  override postDelete() {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'client' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'client' })
    );
    this.messagesService.clearStatus();
  }

  async onClickDelete() {
    this.deleteAndReload(['clients', 'contacts', 'sites'], this.goToClientList);
  }

  async deleteClient(): Promise<string> {
    return await this.operationsService.deleteDocument(
      Collections.Clients,
      'client_id',
      this.clientId
    );
  }

  async deleteContacts(): Promise<string> {
    if (this.client?.contact_ids.length === 0) {
      return Const.SUCCESS;
    }
    return await this.operationsService.deleteDocuments(
      Collections.Contacts,
      'client_id',
      this.clientId
    );
  }

  async deleteSites(): Promise<string> {
    if (this.client?.site_ids.length === 0) {
      return Const.SUCCESS;
    }
    return await this.operationsService.deleteDocuments(
      Collections.Sites,
      'client_id',
      this.clientId
    );
  }

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  getClientId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  async init() {
    this.columns = [
      {
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator
      },
      {
        prop: 'title',
        name: 'Title'
      },
      {
        prop: 'phone',
        name: 'Phone'
      }
    ];

    this.getCombinedData$().subscribe(({ clientId, clients, contacts, jobs, sites }) => {
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
        this.client = client;
        this.client$ = of(client);
        const clientSites = sites.filter((site) => site.client_id === this.clientId);
        this.sites$ = of(clientSites);
        this.rows = [...this.contacts]; // for table of contacts
      }
    });
  }

  getCombinedData$(): Observable<{
    clientId: number;
    clients: IClient[];
    contacts: IContact[];
    jobs: IJob[];
    sites: ISite[];
  }> {
    return combineLatest({
      clientId: this.getClientId(),
      clients: this.dataService.clients$,
      contacts: this.dataService.contacts$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operationsService: OperationsService,
    private messagesService: MessagesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
