import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Art, Client, Contact, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Card } from '../../../shared/components/card/card';
import { Util } from '../../../shared/util/util';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/components/buttons/delete-button/delete-button';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-job-detail',
  imports: [AsyncPipe, PageHeader, RouterLink, Card, NgxDatatableModule, ContactsTable, PageFooter],
  providers: [MessagesService],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
  standalone: true,
})
export class JobDetail implements OnInit, OnDestroy {
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
  clients: Client[] = [];
  sites: Site[] = [];
  artwork: Art[] = [];

  deleteStatus = '';
  clientStatus = '';
  siteStatus = '';
  artStatus = '';
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  async onClickDelete() {
    this.deleteStatus = await this.operationsService.deleteDocument(
      Collections.Jobs,
      'job_id',
      this.jobId
    );
    this.clientStatus = await this.updateClient();
    this.siteStatus = await this.updateSite();
    this.artStatus = await this.updateArt();
    this.messagesService.showStatus(this.deleteStatus, Msgs.DELETED_JOB, Msgs.DELETE_JOB_FAILED);
    this.messagesService.showStatus(this.clientStatus, Msgs.SAVED_CLIENT, Msgs.SAVE_CLIENT_FAILED);
    this.messagesService.showStatus(this.siteStatus, Msgs.SAVED_SITE, Msgs.SAVE_SITE_FAILED);
    this.messagesService.showStatus(this.artStatus, Msgs.SAVED_ART, Msgs.SAVE_ART_FAILED);
    this.messagesService.clearStatus();
    this.dataService.getData(this.goToJobList);
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
      site.job_id = Const.NO_JOB;
      delete (site as any)._id;
      const data = await this.dataService.saveDocument(site, collection, site.site_id, 'site_id');
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
      art.job_id = Const.NO_JOB;
      try {
        delete (art as any)._id;
        const data = await this.dataService.saveDocument(art, collection, art.art_id, 'art_id');
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

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  getJobId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    public util: Util,
    private operationsService: OperationsService,
    private messagesService: MessagesService
  ) {
    combineLatest({
      clients: this.dataService.clients$,
      contacts: this.dataService.contacts$,
      artwork: this.dataService.art$,
      sites: this.dataService.sites$,
      jobId: this.getJobId(),
      jobs: this.dataService.jobs$,
    })
      .pipe(take(1))
      .subscribe(({ clients, contacts, artwork, sites, jobId, jobs }) => {
        this.jobId = jobId;
        this.clients = clients;
        this.sites = sites;
        this.artwork = artwork;
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
