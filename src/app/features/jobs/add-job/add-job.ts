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
  jobId!: number;

  dbData: Job = {} as Job;

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
      this.jobId = Date.now();
      const jobId = this.route.snapshot.paramMap.get('id');
      if (jobId) {
        this.jobId = +jobId;
      }
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
      this.resetForm();
      this.dataService.reload();
    }
  }

  convertIds() {
    const form = this.jobForm.value;
    form.client_id = parseInt(form.client_id);
    form.site_id = parseInt(form.site_id);
    form.contact_ids = form.contact_ids.map((id: any) => parseInt(id));
    form.art_ids = form.art_ids.map((id: any) => parseInt(id));
  }

  async saveJob(jobData: any): Promise<string> {
    this.convertIds();
    const collection = Collections.Jobs;
    let result = Const.SUCCESS;
    try {
      const returnData = await this.dataService.saveDocument(jobData, collection);
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateClient(jobData: any): Promise<string> {
    const client = this.clients.find((client) => client.client_id === jobData.client_id);
    if (!client) {
      console.error('Save job error, could not find the selected client');
      return Const.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      client.job_ids.push(jobData.job_id);
      delete (client as any)._id;
      const returnData = await this.dataService.saveDocument(
        client,
        collection,
        jobData.client_id,
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

  async updateArt(jobData: any): Promise<string> {
    const artwork = this.art.filter((art) => jobData.art_ids.indexOf(art.art_id) !== -1);
    if (!artwork) {
      console.error('Save job error, could not find the selected artwork');
      return Const.FAILURE;
    }
    const collection = Collections.Art;
    let result = Const.SUCCESS;
    try {
      for (const art of artwork) {
        art.job_id = jobData.job_id;
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

  async updateSite(jobData: any): Promise<string> {
    if (jobData.site_id === 0) {
      return Const.SUCCESS; // site is TBD
    }
    const site = this.sites.find((site) => site.site_id === jobData.site_id);
    if (!site) {
      console.error('Save job error, could not find the selected site');
      return Const.FAILURE;
    }
    const collection = Collections.Sites;
    let result = Const.SUCCESS;
    try {
      site.job_id = jobData.job_id;
      delete (site as any)._id;
      const returnData = await this.dataService.saveDocument(
        site,
        collection,
        jobData.site_id,
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
    const clientContacts = this.contacts.filter((contact) => contact.client_id === this.clientId);
    for (const clientContact of clientContacts) {
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
    this.jobForm = this.fb.group({
      job_id: this.jobId,
      job_number: [''],
      client_id: [''],
      site_id: [{ value: '', disabled: true }],
      contact_ids: [{ value: '', disabled: true }],
      art_ids: [{ value: '', disabled: true }],
    });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
