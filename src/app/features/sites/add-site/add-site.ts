import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Job, Site } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { AsyncPipe } from '@angular/common';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-add-site',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, RouterLink, PageFooter],
  providers: [MessagesService],
  templateUrl: './add-site.html',
  styleUrl: './add-site.scss',
  standalone: true,
})
export class AddSite extends AddBase implements OnInit, OnDestroy {
  goToSiteList = () => this.router.navigate(['/sites', 'list']);
  siteListLink = new ActionLink('siteListLink', 'Sites', '/sites/list', '', this.goToSiteList);
  headerData = new HeaderActions('site-add', 'Add Site', [], [this.siteListLink.data]);
  footerData = new FooterActions([new SaveButton(), new CancelButton()]);

  siteForm!: FormGroup;
  submitted = false;
  siteId!: number;

  dbData: Site = {} as Site;

  clients$: Observable<Client[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  clients: Client[] = [];

  siteStatus = '';
  clientStatus = '';

  selectedClientId: number | undefined;

  jobs: Job[] = [];

  async onSubmit() {
    this.submitted = true;
    if (this.siteForm.valid) {
      this.siteId = Date.now();
      const siteId = this.route.snapshot.paramMap.get('id');
      if (siteId) {
        this.siteId = +siteId;
      }
      this.siteForm.value.site_id = this.siteId;
      this.siteForm.value.job_id = Const.NO_JOB;
      this.siteStatus = await this.save(this.siteForm.value);
      this.clientStatus = await this.updateClient(this.siteForm.value);
      this.messagesService.showStatus(this.siteStatus, Msgs.SAVED_SITE, Msgs.SAVE_SITE_FAILED);
      this.messagesService.showStatus(
        this.clientStatus,
        Msgs.SAVED_CLIENT,
        Msgs.SAVE_CLIENT_FAILED
      );
      this.messagesService.clearStatus();
      this.submitted = false;
      this.resetForm();
      this.dataService.reload();
    }
  }

  convertIds() {
    this.siteForm.value.client_id = parseInt(this.siteForm.value.client_id);
  }

  async save(siteData: any): Promise<string> {
    this.convertIds();
    const collectionName = Collections.Sites;
    let result = Const.SUCCESS;
    try {
      const returnData = await this.dataService.saveDocument(siteData, collectionName);
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateClient(formData: any): Promise<string> {
    const client = this.clients.find((client) => client.client_id === formData.client_id);
    if (!client) {
      console.error('Save client error, could not find the selected client');
      return Const.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      client.site_ids.push(formData.site_id);
      delete (client as any)._id;
      const returnData = await this.dataService.saveDocument(
        client,
        collection,
        formData.client_id,
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

  resetForm() {
    this.siteForm.reset();
    this.submitted = false;
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.selectedClientId = +clientId;
      this.siteForm.get('name')?.enable();
      this.siteForm.get('address1')?.enable();
      this.siteForm.get('address2')?.enable();
      this.siteForm.get('city')?.enable();
      this.siteForm.get('state')?.enable();
      this.siteForm.get('zip_code')?.enable();
    } else {
      this.selectedClientId = undefined;
      this.siteForm.get('name')?.disable();
      this.siteForm.get('address1')?.disable();
      this.siteForm.get('address2')?.disable();
      this.siteForm.get('city')?.disable();
      this.siteForm.get('state')?.disable();
      this.siteForm.get('zip_code')?.disable();
    }
  }

  populateData(): void {}

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messagesService: MessagesService
  ) {
    super();
    combineLatest({
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
    })
      .pipe(take(1))
      .subscribe(({ clients, jobs }) => {
        this.clients$ = of(clients);
        this.clients = clients;
        this.jobs$ = of(jobs);
        this.jobs = jobs;
      });
  }

  ngOnInit(): void {
    this.siteForm = this.fb.group({
      site_id: this.siteId,
      name: [{ value: '', disabled: true }],
      address1: [{ value: '', disabled: true }],
      address2: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      state: [{ value: '', disabled: true }],
      zip_code: [{ value: '', disabled: true }],
      client_id: [''],
      job_id: [{ value: '', disabled: true }],
    });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
