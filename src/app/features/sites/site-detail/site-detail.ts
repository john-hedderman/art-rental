import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, distinctUntilChanged, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Job, Site } from '../../../model/models';
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
import { Util } from '../../../shared/util/util';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';

@Component({
  selector: 'app-site-detail',
  imports: [PageHeader, AsyncPipe, PageFooter, RouterLink],
  providers: [MessagesService],
  templateUrl: './site-detail.html',
  styleUrl: './site-detail.scss',
  standalone: true
})
export class SiteDetail extends DetailBase implements OnInit, OnDestroy {
  goToEditSite = () => this.router.navigate(['/sites', this.siteId, 'edit']);
  goToSiteList = () => this.router.navigate(['/sites', 'list']);

  siteListLink = new ActionLink('siteListLink', 'Sites', '/sites/list', '', this.goToSiteList);
  headerData = new HeaderActions('site-detail', 'Site detail', [], [this.siteListLink.data]);

  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditSite
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  siteId = 0;
  clientId = 0;
  jobId = 0;

  site$: Observable<Site> | undefined;
  client$: Observable<Client> | undefined;
  job$: Observable<Job> | undefined;

  site: Site | undefined;
  clients: Client[] = [];
  jobs: Job[] = [];
  job: Job | undefined;

  deleteStatus = '';

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  private readonly destroy$ = new Subject<void>();

  override preDelete(): void {}

  override async delete(): Promise<string> {
    const siteStatus = await this.deleteSite();
    const jobStatus = await this.updateJob();
    const clientStatus = await this.updateClient();
    return this.jobResult([siteStatus, jobStatus, clientStatus]);
  }

  override postDelete() {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'site' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'site' })
    );
    this.messagesService.clearStatus();
  }

  async onClickDelete() {
    this.deleteAndReload(['sites', 'jobs', 'clients'], this.goToSiteList);
  }

  async deleteSite(): Promise<string> {
    return await this.operationsService.deleteDocument(Collections.Sites, 'site_id', this.siteId);
  }

  async updateJob(): Promise<string> {
    if (this.site?.job_id === Const.NO_JOB) {
      return Const.SUCCESS; // site not being used for a job
    }
    const job = this.jobs.find((job) => job.job_id === this.jobId);
    if (!job) {
      console.error('Save site error, could not find the job');
      return Const.FAILURE;
    }
    let result = Const.SUCCESS;
    try {
      job.site_id = Const.NO_SITE;
      delete (job as any)._id;
      const data = await this.dataService.saveDocument(job, Collections.Jobs, job.job_id, 'job_id');
      if (data.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateClient(): Promise<string> {
    const client = this.clients.find((client) => client.client_id === this.clientId);
    if (!client) {
      console.error("Save client error, could not find the site' client");
      return Const.FAILURE;
    }
    if (client.site_ids.indexOf(this.siteId) === -1) {
      return Const.SUCCESS;
    }
    let result = Const.SUCCESS;
    try {
      const newClient = { ...client };
      newClient.site_ids = newClient.site_ids.filter((site_id) => site_id !== this.siteId);
      delete (newClient as any)._id;
      const returnData = await this.dataService.saveDocument(
        newClient,
        Collections.Clients,
        this.clientId,
        'client_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save client error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  getSiteId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  init() {
    this.getCombinedData$().subscribe(({ siteId, clients, jobs, sites }) => {
      this.clients = clients;
      this.jobs = jobs;
      this.siteId = siteId;
      let site = sites.find((site) => site.site_id === siteId);
      if (site) {
        const client = clients.find((client) => client.client_id === site?.client_id);
        if (client) {
          site = { ...site, client };
          this.client$ = of(client);
          this.clientId = client.client_id;
        }
        const job = jobs.find((job) => job.job_id === site?.job_id);
        if (job) {
          site = { ...site, job };
          this.job = job;
          this.job$ = of(job);
          this.jobId = job.job_id;
        }
        this.site$ = of(site);
        this.site = site;
      }
    });
  }

  getCombinedData$(): Observable<{
    siteId: number;
    clients: Client[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      siteId: this.getSiteId(),
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
