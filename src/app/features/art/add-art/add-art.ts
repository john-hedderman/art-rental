import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Art, Artist, Job } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';

@Component({
  selector: 'app-add-art',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, Buttonbar],
  templateUrl: './add-art.html',
  styleUrl: './add-art.scss',
  standalone: true,
})
export class AddArt extends AddBase implements OnInit, OnDestroy {
  goToArtList = () => this.router.navigate(['/art', 'list']);

  artListLink = new ActionLink('artListLink', 'Art', '/art/list', '', this.goToArtList);
  headerData = new HeaderActions('art-add', 'Add Art', [], [this.artListLink.data]);
  footerData = new FooterActions([new SaveButton(), new CancelButton()]);

  artForm!: FormGroup;
  submitted = false;

  saveStatus = '';

  artists$: Observable<Artist[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  dbData: Art = {} as Art;

  artId!: number;
  editMode = false;

  async onSubmit() {
    this.submitted = true;
    if (this.artForm.valid) {
      this.artId = Date.now();
      const artId = this.route.snapshot.paramMap.get('id');
      if (artId) {
        this.artId = +artId;
      }
      this.artForm.value.art_id = this.artId;
      this.artForm.value.artist_id = parseInt(this.artForm.value.artist_id);
      this.artForm.value.job_id = parseInt(this.artForm.value.job_id);
      const id = this.editMode ? this.artId : undefined;
      const field = this.editMode ? 'art_id' : undefined;
      this.saveStatus = await this.operationsService.saveDocument(
        this.artForm.value,
        Collections.Art,
        id,
        field
      );
      this.showOpStatus(this.saveStatus, Msgs.SAVED_ART, Msgs.SAVE_ART_FAILED);
      this.clearOpStatus(this.saveStatus, Const.STD_DELAY);
      this.submitted = false;
      if (this.editMode) {
        this.populateForm(Collections.Art, 'art_id', this.artId);
      } else {
        this.artForm.reset();
      }
      if (this.saveStatus === Const.SUCCESS) {
        this.reloadFromDb([Collections.Art]);
      }
    }
  }

  populateData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete

    // console.log('populateData, this.dbData:', this.dbData);
    // console.log("populateData, this.dbData['art_id']:", this.dbData['art_id']);
    // const id = 'art_id';
    // console.log('populateData, typeof id:', typeof id);
    // console.log('populateData, this.dbData[id]:', this.dbData[id]);
    // console.log('populateData, this.artForm.controls:', this.artForm.controls);
    // for (const control in this.artForm.controls) {
    //   console.log('populateData, control:', control);
    //   console.log('populateData, typeof control:', typeof control);
    //   const x = this.artForm.controls[control];
    //   console.log('populateData, x:', x);
    //   console.log('populateData, this.dbData[control]:', this.dbData[control]);
    //   // this.artForm.get(control)?.setValue(this.dbData[control])
    // }

    this.artForm.get('art_id')?.setValue(this.dbData.art_id);
    this.artForm.get('title')?.setValue(this.dbData.title);
    this.artForm.get('file_name')?.setValue(this.dbData.file_name);
    this.artForm.get('full_size_image_url')?.setValue(this.dbData.full_size_image_url);
    this.artForm.get('artist_id')?.setValue(this.dbData.artist_id);
    this.artForm.get('job_id')?.setValue(this.dbData.job_id);
    this.artForm.get('tags')?.setValue(this.dbData.tags);
  }

  constructor(private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
    super();
    const segments = this.route.snapshot.url.map((x) => x.path);
    if (segments[segments.length - 1] === 'edit') {
      this.headerData.data.headerTitle = 'Edit Art';
    }
    combineLatest({
      artists: this.dataService.load('artists'),
      jobs: this.dataService.load('jobs'),
      clients: this.dataService.load('clients'),
      sites: this.dataService.load('sites'),
    })
      .pipe(take(1))
      .subscribe(({ artists, jobs, clients, sites }) => {
        this.artists$ = of(artists);
        const jobsWithClient = jobs
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
        this.jobs$ = of(jobsWithClient);
      });
  }

  ngOnInit(): void {
    this.artId = Date.now();
    this.editMode = false;

    const artId = this.route.snapshot.paramMap.get('id');
    if (artId) {
      this.artId = +artId;
      this.editMode = true;
      this.populateForm<Art>(Collections.Art, 'art_id', this.artId);
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
  }

  ngOnDestroy(): void {
    this.clearOpStatus('');
  }
}
