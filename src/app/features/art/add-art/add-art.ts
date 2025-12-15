import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Art, Artist, Client, Job, Site } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/buttons/save-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { Util } from '../../../shared/util/util';
import { ResetButton } from '../../../shared/buttons/reset-button';

@Component({
  selector: 'app-add-art',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, PageFooter],
  providers: [MessagesService],
  templateUrl: './add-art.html',
  styleUrl: './add-art.scss',
  standalone: true,
})
export class AddArt extends AddBase implements OnInit, OnDestroy {
  @ViewChild('fileNameTBD') fileNameTBD: ElementRef | undefined;

  goToArtList = () => this.router.navigate(['/art', 'list']);
  artListLink = new ActionLink('artListLink', 'Art', '/art/list', '', this.goToArtList);
  headerData = new HeaderActions('art-add', 'Add Art', [], [this.artListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  artForm!: FormGroup;
  submitted = false;

  saveStatus = '';

  artists$: Observable<Artist[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  jobs: Job[] = [];

  dbData: Art = {} as Art;

  artId!: number;
  editMode = false;

  preSave() {
    this.disableSaveBtn();
    const artId = this.route.snapshot.paramMap.get('id');
    this.artId = artId ? +artId : Date.now();
    this.artForm.value.art_id = this.artId;
    this.artForm.value.artist_id = parseInt(this.artForm.value.artist_id);
    this.artForm.value.job_id = parseInt(this.artForm.value.job_id);
    const filenameTBDEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    if (filenameTBDEl.checked) {
      this.artForm.value.file_name = 'spacer.gif';
    }
  }

  async save(): Promise<string> {
    const artStatus = await this.saveArt();
    const oldJobStatus = this.editMode ? await this.updateOldJob() : Const.SUCCESS;
    const jobStatus = await this.updateJob();
    return this.jobResult([artStatus, oldJobStatus, jobStatus]);
  }

  async onSubmit(): Promise<void> {
    this.submitForm(this.artForm, ['art', 'jobs'], 'art');
  }

  async saveArt(): Promise<string> {
    return await this.operationsService.saveDocument(
      this.artForm.value,
      Collections.Art,
      this.editMode ? this.artId : undefined,
      this.editMode ? 'art_id' : undefined
    );
  }

  async updateOldJob(): Promise<string> {
    const dbData = this.dbData;
    const formData = this.artForm.value;
    if (dbData.job_id === formData.job_id || dbData.job_id === Const.NO_JOB) {
      return Const.SUCCESS;
    }
    const oldJob = this.jobs.find((job) => job.job_id === dbData.job_id);
    if (!oldJob) {
      console.error('Save job error, could not find the previous job');
      return Const.FAILURE;
    }
    const collection = Collections.Jobs;
    let result = Const.SUCCESS;
    try {
      oldJob.art_ids = oldJob.art_ids.filter((art_id) => art_id !== formData.art_id);
      delete (oldJob as any)._id;
      const returnData = await this.dataService.saveDocument(
        oldJob,
        collection,
        dbData.job_id,
        'job_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateJob(): Promise<string> {
    const dbData = this.dbData;
    const formData = this.artForm.value;
    if (dbData.job_id === formData.job_id || formData.job_id === Const.NO_JOB) {
      return Const.SUCCESS;
    }
    const job = this.jobs.find((job) => job.job_id === formData.job_id);
    if (!job) {
      console.error('Save job error, could not find the selected job');
      return Const.FAILURE;
    }
    const collection = Collections.Jobs;
    let result = Const.SUCCESS;
    try {
      job.art_ids.push(formData.art_id);
      delete (job as any)._id;
      const returnData = await this.dataService.saveDocument(
        job,
        collection,
        formData.job_id,
        'job_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  onSelectFileNameTBD() {
    const checkboxEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    if (checkboxEl.checked) {
      this.artForm.get('file_name')?.setValue('');
      this.artForm.get('file_name')?.disable();
    } else {
      this.artForm.get('file_name')?.enable();
    }
  }

  onClickReset() {
    this.resetForm();
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<Art>(Collections.Art, 'art_id', this.artId);
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.artForm.reset();
    this.clearFilename();
  }

  clearFilename() {
    const filenameTBDEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    filenameTBDEl.checked = false;
    this.artForm.get('file_name')?.enable();
  }

  populateData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete

    this.artForm.get('art_id')?.setValue(this.dbData.art_id);
    this.artForm.get('title')?.setValue(this.dbData.title);

    const filenameTBDEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    if (this.dbData.file_name === 'spacer.gif') {
      filenameTBDEl.checked = true;
      this.artForm.get('file_name')?.setValue('');
      this.artForm.get('file_name')?.disable();
    } else {
      filenameTBDEl.checked = false;
      this.artForm.get('file_name')?.enable();
      this.artForm.get('file_name')?.setValue(this.dbData.file_name);
    }

    this.artForm.get('full_size_image_url')?.setValue(this.dbData.full_size_image_url);
    this.artForm.get('artist_id')?.setValue(this.dbData.artist_id);
    this.artForm.get('job_id')?.setValue(this.dbData.job_id);
    this.artForm.get('tags')?.setValue(this.dbData.tags);
  }

  init(): void {
    this.getCombinedData$().subscribe(({ artists, jobs, clients, sites }) => {
      this.artists$ = of(artists);
      this.jobs = jobs;
      const fullJobs = jobs
        .map((job) => {
          const client = clients.find((client) => client.client_id === job.client_id);
          if (client) {
            return { ...job, client };
          }
          return job;
        })
        .map((job) => {
          const site = sites.find((site) => site.site_id === job.site_id);
          if (site) {
            return { ...job, site };
          }
          return job;
        });
      this.jobs$ = of(fullJobs);
    });

    this.artId = Date.now();
    this.editMode = false;
    const artId = this.route.snapshot.paramMap.get('id');
    if (artId) {
      this.artId = +artId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Art';
    }

    this.artForm = this.fb.group({
      art_id: this.artId,
      title: [''],
      file_name: [''],
      full_size_image_url: [''],
      artist_id: [null],
      job_id: [null],
      tags: [''],
    });

    if (this.editMode) {
      this.populateForm<Art>(Collections.Art, 'art_id', this.artId);
    }
  }

  getCombinedData$(): Observable<{
    artists: Artist[];
    jobs: Job[];
    clients: Client[];
    sites: Site[];
  }> {
    return combineLatest({
      artists: this.dataService.artists$,
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
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
