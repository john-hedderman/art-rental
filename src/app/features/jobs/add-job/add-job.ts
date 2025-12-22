import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { Art, Client, Contact, Job, Site } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import * as Const from '../../../constants';
import { SaveButton } from '../../../shared/buttons/save-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { ResetButton } from '../../../shared/buttons/reset-button';

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
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

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

  saveStatus = '';

  preSave() {
    this.disableSaveBtn();
    const jobId = this.route.snapshot.paramMap.get('id');
    this.jobId = jobId ? +jobId : Date.now();
    this.jobForm.value.job_id = this.jobId;
  }

  async save(): Promise<string> {
    const jobStatus = await this.saveJob();
    const clientStatus = await this.updateClient();
    const siteStatus = await this.updateSite();
    const artStatus = await this.updateArt();
    return this.jobResult([jobStatus, clientStatus, siteStatus, artStatus]);
  }

  async onSubmit(): Promise<void> {
    this.submitForm(this.jobForm, ['jobs', 'clients', 'sites', 'art'], 'job');
  }

  convertIds() {
    const form = this.jobForm.value;
    form.client_id = parseInt(form.client_id);
    form.site_id = parseInt(form.site_id);
    form.contact_ids = form.contact_ids.map((id: any) => parseInt(id));
    form.art_ids = form.art_ids.map((id: any) => parseInt(id));
  }

  async saveJob(): Promise<string> {
    const formData = this.jobForm.value;
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

  async updateClient(): Promise<string> {
    const formData = this.jobForm.value;
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

  async updateArt(): Promise<string> {
    const formData = this.jobForm.value;
    const collection = Collections.Art;
    let result = Const.SUCCESS;
    try {
      const dbArt = [...this.art];
      for (const piece of dbArt) {
        const art = { ...piece };
        const oldJobId = art.job_id;
        const isArtInSelected = formData.art_ids.includes(art.art_id);
        const newJobId = isArtInSelected ? formData.job_id : Const.NO_JOB;
        if (newJobId === oldJobId) {
          result = Const.SUCCESS;
        } else {
          art.job_id = newJobId;
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
      }
    } catch (error) {
      console.error('Save art error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateSite(): Promise<string> {
    const formData = this.jobForm.value;
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

  onClickReset() {
    this.resetForm();
    const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
    clientSelectEl.options[0].selected = true;
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<Job>(Collections.Jobs, 'job_id', this.jobId);
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.jobForm.reset();
    this.resetMenus();
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.clientId = +clientId;
      this.enableMenu('site_id');
      this.disableMenu('contact_ids');
      this.disableMenu('art_ids');
    } else {
      this.resetMenus();
    }
  }

  resetMenus() {
    this.clientId = undefined;
    this.depopulateMenu('site_id');
    const menu = document.getElementById('site_id') as HTMLSelectElement;
    let newOption = new Option('Select a job site...', '');
    menu?.add(newOption);
    this.jobForm.get('site_id')?.disable();
    this.disableMenu('contact_ids');
    this.disableMenu('art_ids');
  }

  onSelectSite(event: any) {
    const siteId = event.target.value;
    if (siteId !== '') {
      this.enableMenu('contact_ids');
      this.enableMenu('art_ids');
    } else {
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
    const availableContacts = this.contacts.filter(
      (contact: Contact) => contact.client_id === this.clientId
    );
    for (const clientContact of availableContacts) {
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
    const availableArt = this.art.filter(
      (art) => art.job_id === Const.NO_JOB || art.job_id === this.jobId
    );
    for (const art of availableArt) {
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
    siteSelectEl.dispatchEvent(new Event('change')); // triggers onSelectSite

    const contactsSelectEl = document.getElementById('contact_ids') as HTMLSelectElement;
    let contactsAssigned = false;
    for (const option of contactsSelectEl.options) {
      if (this.dbData.contact_ids.includes(+option.value)) {
        contactsAssigned = true;
        option.selected = true;
        option.dispatchEvent(new Event('change'));
      } else {
        option.selected = false;
      }
    }
    if (!contactsAssigned) {
      contactsSelectEl.options[0].selected = true;
    }
    contactsSelectEl.dispatchEvent(new Event('change'));

    const artSelectEl = document.getElementById('art_ids') as HTMLSelectElement;
    let artAssigned = false;
    for (const option of artSelectEl.options) {
      if (this.dbData.art_ids.includes(+option.value)) {
        artAssigned = true;
        option.selected = true;
        option.dispatchEvent(new Event('change'));
      } else {
        option.selected = false;
      }
    }
    if (!artAssigned) {
      artSelectEl.options[0].selected = true;
    }
    artSelectEl.dispatchEvent(new Event('change'));
  }

  init() {
    this.getCombinedData$().subscribe(({ art, clients, contacts, sites }) => {
      this.clients = clients;
      this.clients$ = of(clients);
      this.sites = sites;
      this.sites$ = of(sites);
      this.contacts = contacts;
      this.contacts$ = of(contacts);
      this.art = art;
      this.art$ = of(art);
    });

    this.jobId = Date.now();
    this.editMode = false;

    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.jobId = +jobId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Job';
    }

    this.jobForm = this.fb.group({
      job_id: this.jobId,
      job_number: [''],
      client_id: [''],
      site_id: [{ value: '', disabled: this.editMode ? false : true }],
      contact_ids: [{ value: '', disabled: this.editMode ? false : true }],
      art_ids: [{ value: '', disabled: this.editMode ? false : true }],
    });

    if (this.editMode) {
      this.populateForm<Job>(Collections.Jobs, 'job_id', this.jobId);
    }
  }

  getCombinedData$(): Observable<{
    art: Art[];
    clients: Client[];
    contacts: Contact[];
    sites: Site[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      clients: this.dataService.clients$,
      contacts: this.dataService.contacts$,
      sites: this.dataService.sites$,
    }).pipe(take(1));
  }

  constructor(private router: Router, private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
