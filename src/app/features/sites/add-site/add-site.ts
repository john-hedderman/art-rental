import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Job, Site } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { AsyncPipe } from '@angular/common';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';

@Component({
  selector: 'app-add-site',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, RouterLink, Buttonbar],
  templateUrl: './add-site.html',
  styleUrl: './add-site.scss',
  standalone: true,
})
export class AddSite extends AddBase implements OnInit {
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

  siteStatus = '';

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
      this.siteStatus = await this.save(this.siteForm.value);
      this.showOpStatus(this.siteStatus, Msgs.SAVED_SITE, Msgs.SAVE_SITE_FAILED);
      this.clearOpStatus(this.siteStatus, Const.STD_DELAY);
      this.submitted = false;
      this.resetForm();
      if (this.siteStatus === Const.SUCCESS) {
        this.reloadFromDb([Collections.Sites]);
      }
    }
  }

  convertIds() {
    this.siteForm.value.client_id = parseInt(this.siteForm.value.client_id);
    this.siteForm.value.job_id = parseInt(this.siteForm.value.job_id);
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

  resetForm() {
    this.siteForm.reset();
    this.siteForm.get('job_id')?.disable();
    this.submitted = false;
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.selectedClientId = +clientId;
      this.enableMenu('job_id');
      this.siteForm.get('name')?.enable();
      this.siteForm.get('address1')?.enable();
      this.siteForm.get('address2')?.enable();
      this.siteForm.get('city')?.enable();
      this.siteForm.get('state')?.enable();
      this.siteForm.get('zip_code')?.enable();
    } else {
      this.selectedClientId = undefined;
      this.disableMenu('job_id');
      this.siteForm.get('name')?.disable();
      this.siteForm.get('address1')?.disable();
      this.siteForm.get('address2')?.disable();
      this.siteForm.get('city')?.disable();
      this.siteForm.get('state')?.disable();
      this.siteForm.get('zip_code')?.disable();
    }
  }

  disableMenu(menuId: string) {
    this.siteForm.get(menuId)?.disable();
    this.depopulateMenu(menuId);
  }

  enableMenu(menuId: string) {
    this.siteForm.get(menuId)?.enable();
    this.depopulateMenu(menuId);
    this.populateJobsMenu();
  }

  depopulateMenu(menuId: string) {
    const menu = document.getElementById(menuId) as HTMLSelectElement;
    while (menu.options.length > 0) {
      menu.remove(0);
    }
  }

  populateJobsMenu() {
    const menu = document.getElementById('job_id') as HTMLSelectElement;
    let newOption = new Option('Select a job...', '');
    menu?.add(newOption);
    newOption = new Option('Not on a job', '0');
    menu?.add(newOption);
    const clientJobs = this.jobs.filter((job) => job.client_id === this.selectedClientId);
    for (const clientJob of clientJobs) {
      newOption = new Option(clientJob.job_number, clientJob.job_id.toString());
      menu?.add(newOption);
    }
  }

  populateData(): void {}

  constructor(private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
    super();
    combineLatest({
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
    })
      .pipe(take(1))
      .subscribe(({ clients, jobs }) => {
        this.clients$ = of(clients);
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
}
