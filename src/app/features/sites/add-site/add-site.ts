import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, HeaderData, Job } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-add-site',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe],
  templateUrl: './add-site.html',
  styleUrl: './add-site.scss',
  standalone: true,
})
export class AddSite implements OnInit {
  goToSiteList = () => {
    this.router.navigate(['/sites', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Site',
    headerButtons: [
      {
        id: 'goToSiteListBtn',
        label: 'Site list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToSiteList,
      },
    ],
  };

  siteForm!: FormGroup;
  submitted = false;
  site_id!: number;

  clients$: Observable<Client[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  selectedClientId: number | undefined;

  jobs: Job[] = [];

  onSubmit() {
    this.submitted = true;
    if (this.siteForm.valid) {
      this.siteForm.value.site_id = Date.now();
      this.siteForm.value.client_id = parseInt(this.siteForm.value.client_id);
      this.siteForm.value.job_id = parseInt(this.siteForm.value.job_id);
      this.save(this.siteForm.value);
      this.resetForm();
    }
  }

  save(siteData: any) {
    const collectionName = Collections.Sites;
    this.dataService.saveDocument(siteData, collectionName);
  }

  resetForm() {
    this.siteForm.reset();
    this.siteForm.get('job_id')?.disable();
    this.submitted = false;
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    this.selectedClientId = +clientId;
    this.enableMenu('job_id');
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
    newOption = new Option('TBD', 'tbd');
    menu?.add(newOption);
    const clientJobs = this.jobs.filter((job) => job.client_id === this.selectedClientId);
    for (const clientJob of clientJobs) {
      newOption = new Option(clientJob.job_number, clientJob.job_id.toString());
      menu?.add(newOption);
    }
  }

  constructor(private router: Router, private fb: FormBuilder, private dataService: DataService) {
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
      site_id: this.site_id,
      name: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      client_id: [''],
      job_id: [{ value: '', disabled: true }],
    });
  }
}
