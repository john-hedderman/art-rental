import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { Art, Client, Contact, HeaderData, Site } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-add-job',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './add-job.html',
  styleUrl: './add-job.scss',
  standalone: true,
})
export class AddJob implements OnInit {
  goToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Job',
    headerButtons: [
      {
        id: 'goToJobListBtn',
        label: 'Job list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToJobList,
      },
    ],
    headerLinks: [],
  };

  jobForm!: FormGroup;
  submitted = false;
  job_id!: number;

  sites: Site[] = [];
  contacts: Contact[] = [];
  art: Art[] = [];

  clients$: Observable<Client[]> | undefined;
  sites$: Observable<Site[]> | undefined;
  contacts$: Observable<Contact[]> | undefined;
  art$: Observable<Art[]> | undefined;

  selectedClientId: number | undefined;

  onSubmit() {
    this.jobForm.value.job_id = Date.now();
    this.submitted = true;
    if (this.jobForm.valid) {
      this.jobForm.value.client_id = parseInt(this.jobForm.value.client_id);
      this.jobForm.value.site_id = parseInt(this.jobForm.value.site_id);
      for (let i = 0; i < this.jobForm.value.contact_ids.length; i++) {
        this.jobForm.value.contact_ids[i] = parseInt(this.jobForm.value.contact_ids[i]);
      }
      for (let i = 0; i < this.jobForm.value.art_ids.length; i++) {
        this.jobForm.value.art_ids[i] = parseInt(this.jobForm.value.art_ids[i]);
      }
      this.saveJob(this.jobForm.value);
      this.resetForm();
    }
  }

  saveJob(jobData: any) {
    const collectionName = Collections.Jobs;
    this.dataService.saveDocument(jobData, collectionName);
  }

  resetForm() {
    this.jobForm.reset();
    this.jobForm.get('site_id')?.disable();
    this.disableMenu('contact_ids');
    this.disableMenu('art_ids');
    this.submitted = false;
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.selectedClientId = +clientId;
      this.enableMenu('site_id');
      this.enableMenu('contact_ids');
      this.enableMenu('art_ids');
    } else {
      this.selectedClientId = undefined;
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
    newOption = new Option('TBD', 'tbd');
    menu?.add(newOption);
    const clientSites = this.sites.filter((site) => site.client_id === this.selectedClientId);
    for (const clientSite of clientSites) {
      newOption = new Option(clientSite.name, clientSite.site_id.toString());
      menu?.add(newOption);
    }
  }

  populateContactsMenu() {
    const menu = document.getElementById('contact_ids') as HTMLSelectElement;
    let newOption = new Option('TBD', 'tbd');
    menu?.add(newOption);
    const clientContacts = this.contacts.filter(
      (contact) => contact.client_id === this.selectedClientId
    );
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

  constructor(private router: Router, private dataService: DataService, private fb: FormBuilder) {
    combineLatest({
      clients: this.dataService.clients$,
      sites: this.dataService.sites$,
      contacts: this.dataService.contacts$,
      art: this.dataService.art$,
    })
      .pipe(take(1))
      .subscribe(({ clients, sites, contacts, art }) => {
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
    this.jobForm = this.fb.group({
      job_id: this.job_id,
      job_number: [''],
      client_id: [''],
      site_id: [{ value: '', disabled: true }],
      contact_ids: [{ value: '', disabled: true }],
      art_ids: [{ value: '', disabled: true }],
    });
  }
}
