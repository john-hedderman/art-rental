import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, distinctUntilChanged, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Art, Client, Contact, Job, Site } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Util } from '../../../shared/util/util';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { ArtThumbnailCard } from '../../../shared/components/art-thumbnail-card/art-thumbnail-card';

@Component({
  selector: 'app-job-detail',
  imports: [
    AsyncPipe,
    PageHeader,
    RouterLink,
    NgxDatatableModule,
    ContactsTable,
    PageFooter,
    ArtThumbnailCard
  ],
  providers: [MessagesService],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
  standalone: true
})
export class JobDetail extends DetailBase implements OnInit, OnDestroy {
  @ViewChild('contactsTable') table!: DatatableComponent<Contact>;
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;

  goToArtDetail = (id: number) => this.router.navigate(['/art', id]);
  goToEditJob = () => this.router.navigate(['/jobs', this.jobId, 'edit']);
  goToJobList = () => this.router.navigate(['/jobs', 'list']);

  jobListLink = new ActionLink('jobListLink', 'Jobs', '/jobs/list', '', this.goToJobList);
  headerData = new HeaderActions('job-detail', 'Job detail', [], [this.jobListLink.data]);

  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditJob
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  thumbnail_path = 'images/art/';

  jobId = 0;
  clientId: number | undefined = 0;

  job$: Observable<Job> | undefined;
  art$: Observable<Art[]> | undefined;

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  job: Job | undefined;
  artwork: Art[] = [];
  clients: Client[] = [];
  jobs: Job[] = [];
  sites: Site[] = [];

  deleteStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  private readonly destroy$ = new Subject<void>();

  override preDelete(): void {}

  override async delete(): Promise<string> {
    const jobStatus = await this.deleteJob();
    const warehouseStatus = await this.updateWarehouse();
    const clientStatus = await this.updateClient();
    const siteStatus = await this.updateSite();
    const artStatus = await this.updateArt();
    return this.jobResult([jobStatus, warehouseStatus, clientStatus, siteStatus, artStatus]);
  }

  override postDelete() {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'job' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'job' })
    );
    this.messagesService.clearStatus();
  }

  async onClickDelete() {
    this.deleteAndReload(['jobs', 'clients', 'sites', 'art'], this.goToJobList);
  }

  async deleteJob(): Promise<string> {
    return await this.operationsService.deleteDocument(Collections.Jobs, 'job_id', this.jobId);
  }

  async updateWarehouse(): Promise<string> {
    const warehouse = this.jobs.find((job) => job.job_id === Const.WAREHOUSE_JOB_ID);
    if (!warehouse) {
      console.error('Save job error, could not find the warehouse job');
      return Const.FAILURE;
    }
    const collection = Collections.Jobs;
    let result = Const.SUCCESS;
    try {
      const returnedArtIds = this.job?.art_ids;
      if (returnedArtIds && returnedArtIds.length) {
        const newWarehouseArtIds = [...new Set([...warehouse.art_ids, ...returnedArtIds])];
        warehouse.art_ids = newWarehouseArtIds;
        delete warehouse.art;
        delete warehouse.contacts;
        delete warehouse.site;
        delete (warehouse as any)._id;
        const data = await this.dataService.saveDocument(
          warehouse,
          collection,
          Const.WAREHOUSE_JOB_ID,
          'job_id'
        );
        if (data.modifiedCount === 0) {
          result = Const.FAILURE;
        }
      }
    } catch (error) {
      console.error('Save warehouse job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateClient(): Promise<string> {
    const client = this.clients.find((client) => client.client_id === this.clientId);
    if (!client) {
      console.error('Save client error, could not find the client');
      return Const.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      client.job_ids = client.job_ids.filter((job_id) => job_id !== this.jobId);
      delete (client as any)._id;
      const data = await this.dataService.saveDocument(
        client,
        collection,
        this.clientId,
        'client_id'
      );
      if (data.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save client error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateSite(): Promise<string> {
    if (this.job?.site_id === 0) {
      return Const.SUCCESS; // site is TBD
    }
    const site = this.sites.find((site) => site.job_id === this.jobId);
    if (!site) {
      console.error('Save site error, could not find the job site');
      return Const.FAILURE;
    }
    const collection = Collections.Sites;
    let result = Const.SUCCESS;
    try {
      const newSite = { ...site };
      newSite.job_id = Const.NO_JOB;
      delete (newSite as any)._id;
      const data = await this.dataService.saveDocument(
        newSite,
        collection,
        newSite.site_id,
        'site_id'
      );
      if (data.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save site error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateArt(): Promise<string> {
    const collection = Collections.Art;
    let compositeResult = Const.SUCCESS;
    const artwork = this.artwork.filter((art) => art.job_id === this.jobId);
    for (const art of artwork) {
      const newArt = { ...art };
      newArt.job_id = Const.NO_JOB;
      try {
        delete (newArt as any)._id;
        const data = await this.dataService.saveDocument(
          newArt,
          collection,
          newArt.art_id,
          'art_id'
        );
        if (data.modifiedCount === 0) {
          compositeResult = Const.FAILURE;
        }
      } catch (error) {
        console.error('Save art error:', error);
        compositeResult = Const.FAILURE;
      }
    }
    return compositeResult;
  }

  nameComparator(rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  getJobId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  init() {
    this.getCombinedData$().subscribe(({ jobId, artwork, clients, contacts, jobs, sites }) => {
      this.jobId = jobId;
      this.artwork = artwork;
      this.clients = clients;
      this.jobs = jobs;
      this.sites = sites;
      const job = jobs.find((job) => job.job_id === jobId);
      if (job) {
        this.job = job;
        job.client = clients.find((client) => client.client_id === job.client_id);
        this.clientId = job.client?.client_id;
        job.contacts = contacts
          .filter((contact) => job.contact_ids.indexOf(contact.contact_id) !== -1)
          .map((contact) => {
            const client = clients.find((client) => client.client_id === contact.client_id);
            return { ...contact, client };
          });
        job.art = artwork.filter((art) => art.job_id === jobId);
        this.art$ = of(job.art);
        job.site = sites.find((site) => site.site_id === job.site_id);
        this.job$ = of(job); // for template
        this.rows = [...job.contacts]; // for table of contacts
      }
    });

    this.columns = [
      {
        prop: '',
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
  }

  getCombinedData$(): Observable<{
    jobId: number;
    artwork: Art[];
    clients: Client[];
    contacts: Contact[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      jobId: this.getJobId(),
      clients: this.dataService.clients$,
      contacts: this.dataService.contacts$,
      artwork: this.dataService.art$,
      sites: this.dataService.sites$,
      jobs: this.dataService.jobs$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public util: Util,
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
