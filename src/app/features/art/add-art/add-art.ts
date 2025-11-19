import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Art, Artist, ButtonbarData, HeaderData, HeaderLink, Job } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';
import { ActionLink, HeaderActions } from '../../../shared/actions/action-data';

@Component({
  selector: 'app-add-art',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, Buttonbar],
  templateUrl: './add-art.html',
  styleUrl: './add-art.scss',
  standalone: true,
})
export class AddArt implements OnInit, OnDestroy {
  goBack = () => {
    if (this.editMode) {
      this.router.navigate(['/art', this.artId]);
    } else {
      this.router.navigate(['/art', 'list']);
    }
  };
  goToArtList = () => this.router.navigate(['/art', 'list']);

  artListLink = new ActionLink('artListLink', 'Art', '/art/list', '', this.goToArtList);
  headerData = new HeaderActions('art-add', 'Add Art', [], [this.artListLink.data]);

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'saveBtn',
        label: 'Save',
        type: 'submit',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: null,
      },
      {
        id: 'cancelBtn',
        label: 'Cancel',
        type: 'button',
        buttonClass: 'btn btn-outline-secondary ms-3',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goBack,
      },
    ],
  };

  artForm!: FormGroup;
  submitted = false;

  saveStatus = '';

  artists$: Observable<Artist[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  artDBData: Art = {} as Art;

  artId!: number;
  editMode = false;

  reloadFromDb() {
    this.dataService.load('art').subscribe((art) => this.dataService.art$.next(art));
  }

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalArtStatus() {
    this.signalStatus(this.saveStatus, Msgs.SAVED_ART, Msgs.SAVE_ART_FAILED);
  }

  signalResetStatus(delay?: number) {
    if (this.saveStatus === Const.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.artForm.valid) {
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
      this.signalArtStatus();
      this.signalResetStatus(1500);
      this.submitted = false;
      if (this.editMode) {
        this.populateForm();
      } else {
        this.artForm.reset();
      }
      if (this.saveStatus === Const.SUCCESS) {
        this.reloadFromDb();
      }
    }
  }

  populateArtData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artForm.get('art_id')?.setValue(this.artDBData.art_id);
    this.artForm.get('title')?.setValue(this.artDBData.title);
    this.artForm.get('file_name')?.setValue(this.artDBData.file_name);
    this.artForm.get('full_size_image_url')?.setValue(this.artDBData.full_size_image_url);
    this.artForm.get('artist_id')?.setValue(this.artDBData.artist_id);
    this.artForm.get('job_id')?.setValue(this.artDBData.job_id);
    this.artForm.get('tags')?.setValue(this.artDBData.tags);
  }

  populateForm() {
    this.http
      .get<Art[]>(`http://localhost:3000/data/art/${this.artId}?recordId=art_id`)
      .subscribe((art) => {
        if (art && art.length === 1) {
          this.artDBData = art[0];
          if (this.artDBData) {
            this.populateArtData();
          }
        }
      });
  }

  constructor(
    private router: Router,
    private dataService: DataService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private operationsService: OperationsService
  ) {
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
      this.populateForm();
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
    this.signalResetStatus(1500);
  }
}
