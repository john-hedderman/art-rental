import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Job, Site } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { AsyncPipe } from '@angular/common';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { Util } from '../../../shared/util/util';

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
  resetButton = new ActionButton(
    'resetBtn',
    'Reset',
    'button',
    'btn btn-outline-secondary ms-3',
    false,
    'modal',
    '#confirmModal',
    null
  );
  footerData = new FooterActions([new SaveButton(), this.resetButton, new CancelButton()]);

  siteForm!: FormGroup;
  submitted = false;

  clients$: Observable<Client[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  clients: Client[] = [];

  siteStatus = '';
  clientStatus = '';

  jobs: Job[] = [];

  dbData: Site = {} as Site;

  siteId!: number;
  editMode = false;

  async onSubmit() {
    this.submitted = true;
    if (this.siteForm.valid) {
      const siteId = this.route.snapshot.paramMap.get('id');
      this.siteId = siteId ? +siteId : Date.now();
      this.siteForm.value.site_id = this.siteId;
      this.siteForm.value.job_id = Const.NO_JOB;
      this.siteStatus = await this.saveSite(this.siteForm.value);
      if (!this.editMode) {
        this.clientStatus = await this.updateClient(this.siteForm.value);
      }
      this.messagesService.showStatus(
        this.siteStatus,
        Util.replaceTokens(Msgs.SAVED, { entity: 'site' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'site' })
      );
      if (!this.editMode) {
        this.messagesService.showStatus(
          this.clientStatus,
          Util.replaceTokens(Msgs.SAVED, { entity: 'client' }),
          Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'client' })
        );
      }
      this.messagesService.clearStatus();
      this.resetForm();
      this.dataService.reloadData(['sites', 'clients']);
    }
  }

  convertIds() {
    if (this.editMode) {
      this.siteForm.value.client_id = this.dbData.client_id;
    } else {
      this.siteForm.value.client_id = parseInt(this.siteForm.value.client_id);
    }
  }

  async saveSite(formData: any): Promise<string> {
    this.convertIds();
    const collectionName = Collections.Sites;
    let result = Const.SUCCESS;
    try {
      const id = this.editMode ? this.siteId : undefined;
      const field = this.editMode ? 'site_id' : undefined;
      const returnData = await this.dataService.saveDocument(formData, collectionName, id, field);
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save site error:', error);
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

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.siteForm.get('name')?.enable();
      this.siteForm.get('address1')?.enable();
      this.siteForm.get('address2')?.enable();
      this.siteForm.get('city')?.enable();
      this.siteForm.get('state')?.enable();
      this.siteForm.get('zip_code')?.enable();
    } else {
      this.siteForm.get('name')?.disable();
      this.siteForm.get('address1')?.disable();
      this.siteForm.get('address2')?.disable();
      this.siteForm.get('city')?.disable();
      this.siteForm.get('state')?.disable();
      this.siteForm.get('zip_code')?.disable();
    }
  }

  onClickReset() {
    this.resetForm();
    if (!this.editMode) {
      const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
      clientSelectEl.options[0].selected = true;
      clientSelectEl.dispatchEvent(new Event('change'));
    }
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<Site>(Collections.Sites, 'site_id', this.siteId);
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.siteForm.reset();
  }

  populateData(): void {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.siteForm.get('site_id')?.setValue(this.dbData.site_id);
    this.siteForm.get('name')?.setValue(this.dbData.name);
    this.siteForm.get('address1')?.setValue(this.dbData.address1);
    this.siteForm.get('address2')?.setValue(this.dbData.address2);
    this.siteForm.get('city')?.setValue(this.dbData.city);
    this.siteForm.get('state')?.setValue(this.dbData.state);
    this.siteForm.get('zip_code')?.setValue(this.dbData.zip_code);
    this.siteForm.get('client_id')?.setValue(this.dbData.client_id);
    this.siteForm.get('job_id')?.setValue(this.dbData.job_id);
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messagesService: MessagesService
  ) {
    super();
    const segments = this.route.snapshot.url.map((x) => x.path);
    if (segments[segments.length - 1] === 'edit') {
      this.headerData.data.headerTitle = 'Edit Site';
    }
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
    this.siteId = Date.now();
    this.editMode = false;

    const siteId = this.route.snapshot.paramMap.get('id');
    if (siteId) {
      this.siteId = +siteId;
      this.editMode = true;
      this.populateForm<Site>(Collections.Sites, 'site_id', this.siteId);
    }

    this.siteForm = this.fb.group({
      site_id: this.siteId,
      name: [{ value: '', disabled: this.editMode ? false : true }],
      address1: [{ value: '', disabled: this.editMode ? false : true }],
      address2: [{ value: '', disabled: this.editMode ? false : true }],
      city: [{ value: '', disabled: this.editMode ? false : true }],
      state: [{ value: '', disabled: this.editMode ? false : true }],
      zip_code: [{ value: '', disabled: this.editMode ? false : true }],
      client_id: [''],
      job_id: [{ value: '', disabled: this.editMode ? false : true }],
    });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
