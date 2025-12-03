import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { Art, Client, Contact, Job, Site } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-add-job',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, RouterLink, PageFooter],
  providers: [MessagesService],
  templateUrl: './add-job.html',
  styleUrl: './add-job.scss',
  standalone: true,
})
export class AddJob extends AddBase implements OnInit, OnDestroy {
  goToJobList = () => this.router.navigate(['/jobs', 'list']);
  jobListLink = new ActionLink('jobListLink', 'Jobs', '/jobs/list', '', this.goToJobList);
  headerData: HeaderActions = new HeaderActions('job-add', 'Add Job', [], [this.jobListLink.data]);
  footerData = new FooterActions([new SaveButton(), new CancelButton()]);

  jobForm!: FormGroup;
  submitted = false;
  editMode = false;
  jobId!: number;

  dbData: Job = {} as Job;
  contactsDBData: Contact[] = [];

  clients: Client[] = [];
  sites: Site[] = [];
  contacts: Contact[] = [];
  art: Art[] = [];

  clients$: Observable<Client[]> | undefined;
  sites$: Observable<Site[]> | undefined;
  contacts$: Observable<Contact[]> | undefined;
  art$: Observable<Art[]> | undefined;

  clientId: number | undefined;

  jobStatus = '';
  clientStatus = '';
  artStatus = '';
  siteStatus = '';

  async onSubmit() {
    this.submitted = true;
    if (this.jobForm.valid) {
      const jobId = this.route.snapshot.paramMap.get('id');
      this.jobId = jobId ? +jobId : Date.now();
      this.jobForm.value.job_id = this.jobId;
      this.jobStatus = await this.saveJob(this.jobForm.value);
      this.clientStatus = await this.updateClient(this.jobForm.value);
      this.artStatus = await this.updateArt(this.jobForm.value);
      this.siteStatus = await this.updateSite(this.jobForm.value);
      this.messagesService.showStatus(this.jobStatus, Msgs.SAVED_JOB, Msgs.SAVE_JOB_FAILED);
      this.messagesService.showStatus(
        this.clientStatus,
        Msgs.SAVED_CLIENT,
        Msgs.SAVE_CLIENT_FAILED
      );
      this.messagesService.showStatus(this.siteStatus, Msgs.SAVED_SITE, Msgs.SAVE_SITE_FAILED);
      this.messagesService.showStatus(this.artStatus, Msgs.SAVED_ART, Msgs.SAVE_ART_FAILED);
      this.messagesService.clearStatus();
      this.submitted = false;

      if (this.editMode) {
        this.populateForm<Job>(Collections.Jobs, 'job_id', this.jobId);
      } else {
        this.resetForm();
      }

      this.dataService.getData();
    }
  }

  convertIds() {
    const form = this.jobForm.value;
    form.client_id = parseInt(form.client_id);
    form.site_id = parseInt(form.site_id);
    form.contact_ids = form.contact_ids.map((id: any) => parseInt(id));
    form.art_ids = form.art_ids.map((id: any) => parseInt(id));
  }

  async saveJob(formData: any): Promise<string> {
    this.convertIds();
    const collection = Collections.Jobs;
    let result = Const.SUCCESS;
    try {
      const id = this.editMode ? this.jobId : undefined;
      const field = this.editMode ? 'job_id' : undefined;
      const returnData = await this.dataService.saveDocument(formData, collection, id, field);
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
      client.job_ids.push(formData.job_id);
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

  async updateArt(formData: any): Promise<string> {
    const artwork = this.art.filter((art) => formData.art_ids.indexOf(art.art_id) !== -1);
    if (!artwork) {
      console.error('Save art error, could not find the selected art');
      return Const.FAILURE;
    }
    const collection = Collections.Art;
    let result = Const.SUCCESS;
    try {
      for (const art of artwork) {
        art.job_id = formData.job_id;
        delete (art as any)._id;
        const returnData = await this.dataService.saveDocument(
          art,
          collection,
          art.art_id,
          'art_id'
        );
        if (returnData.modifiedCount === 0) {
          result = Const.FAILURE;
        }
      }
    } catch (error) {
      console.error('Save art error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateSite(formData: any): Promise<string> {
    if (formData.site_id === Const.TBD) {
      return Const.SUCCESS; // site is TBD
    }
    const site = this.sites.find((site) => site.site_id === formData.site_id);
    if (!site) {
      console.error('Save site error, could not find the selected site');
      return Const.FAILURE;
    }
    const collection = Collections.Sites;
    let result = Const.SUCCESS;
    try {
      site.job_id = formData.job_id;
      delete (site as any)._id;
      const returnData = await this.dataService.saveDocument(
        site,
        collection,
        formData.site_id,
        'site_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save site error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  resetForm() {
    this.jobForm.reset();
    this.jobForm.get('site_id')?.disable();
    this.disableMenu('contact_ids');
    this.disableMenu('art_ids');
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.clientId = +clientId;
      this.enableMenu('site_id');
      this.enableMenu('contact_ids');
      this.enableMenu('art_ids');
    } else {
      this.clientId = undefined;
      this.jobForm.get('site_id')?.disable();
      this.disableMenu('contact_ids');
      this.disableMenu('art_ids');
    }
  }

  disableMenu(menuId: string) {
    this.jobForm.get(menuId)?.disable();
    this.depopulateMenu(menuId);
  }

  depopulateMenu(menuId: string) {
    const menu = document.getElementById(menuId) as HTMLSelectElement;
    while (menu.options.length > 0) {
      menu.remove(0);
    }
  }

  enableMenu(menuId: string) {
    this.jobForm.get(menuId)?.enable();
    this.depopulateMenu(menuId);
    switch (menuId) {
      case 'site_id':
        this.populateSiteMenu();
        break;
      case 'contact_ids':
        this.populateContactsMenu();
        break;
      case 'art_ids':
        this.populateArtMenu();
        break;
    }
  }

  populateSiteMenu() {
    const menu = document.getElementById('site_id') as HTMLSelectElement;
    let newOption = new Option('Select a job site...', '');
    menu?.add(newOption);
    newOption = new Option('TBD', '0');
    menu?.add(newOption);
    const clientSites = this.sites.filter((site) => site.client_id === this.clientId);
    for (const clientSite of clientSites) {
      newOption = new Option(clientSite.name, clientSite.site_id.toString());
      menu?.add(newOption);
    }
  }

  populateContactsMenu() {
    const menu = document.getElementById('contact_ids') as HTMLSelectElement;
    let newOption = new Option('TBD', 'tbd');
    menu?.add(newOption);
    for (const clientContact of this.contacts) {
      newOption = new Option(
        `${clientContact.first_name} ${clientContact.last_name}`,
        clientContact.contact_id.toString()
      );
      menu?.add(newOption);
    }
  }

  populateArtMenu() {
    const menu = document.getElementById('art_ids') as HTMLSelectElement;
    let newOption = new Option('TBD', 'tbd');
    menu?.add(newOption);
    for (const art of this.art) {
      newOption = new Option(art.title, art.art_id.toString());
      menu?.add(newOption);
    }
  }

  populateData(): void {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.jobForm.get('job_id')?.setValue(this.dbData.job_id);
    this.jobForm.get('job_number')?.setValue(this.dbData.job_number);
    this.jobForm.get('client_id')?.setValue(this.dbData.client_id);
    this.clientId = this.dbData.client_id;

    const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
    clientSelectEl.value = this.dbData.client_id.toString();
    clientSelectEl.dispatchEvent(new Event('change')); // triggers onSelectClient

    const siteSelectEl = document.getElementById('site_id') as HTMLSelectElement;
    siteSelectEl.value = this.dbData.site_id.toString();
    siteSelectEl.dispatchEvent(new Event('change'));

    const contactsSelectEl = document.getElementById('contact_ids') as HTMLSelectElement;
    let contactsAssigned = false;
    for (const option of contactsSelectEl.options) {
      if (this.dbData.contact_ids.includes(+option.value)) {
        contactsAssigned = true;
        option.selected = true;
        option.dispatchEvent(new Event('change'));
      }
    }
    if (!contactsAssigned) {
      contactsSelectEl.options[0].selected = true;
      contactsSelectEl.options[0].dispatchEvent(new Event('change'));
    }
    contactsSelectEl.dispatchEvent(new Event('change'));

    const artSelectEl = document.getElementById('art_ids') as HTMLSelectElement;
    for (const option of artSelectEl.options) {
      if (this.dbData.art_ids.includes(+option.value)) {
        option.selected = true;
        option.dispatchEvent(new Event('change'));
      }
    }
    artSelectEl.dispatchEvent(new Event('change'));
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
      this.headerData.data.headerTitle = 'Edit Job';
    }
    combineLatest({
      clients: this.dataService.clients$,
      sites: this.dataService.sites$,
      contacts: this.dataService.contacts$,
      art: this.dataService.art$,
    })
      .pipe(take(1))
      .subscribe(({ clients, sites, contacts, art }) => {
        this.clients = clients;
        this.clients$ = of(clients);
        this.sites = sites;
        this.sites$ = of(sites);
        this.contacts = contacts;
        this.contacts$ = of(contacts);
        this.art = art;
        this.art$ = of(art);
      });
  }

  ngOnInit(): void {
    this.jobId = Date.now();
    this.editMode = false;

    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.jobId = +jobId;
      this.editMode = true;
      this.populateForm<Job>(Collections.Jobs, 'job_id', this.jobId);
    }

    this.jobForm = this.fb.group({
      job_id: this.jobId,
      job_number: [''],
      client_id: [''],
      site_id: [{ value: '', disabled: this.editMode ? false : true }],
      contact_ids: [{ value: '', disabled: this.editMode ? false : true }],
      art_ids: [{ value: '', disabled: this.editMode ? false : true }],
    });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
