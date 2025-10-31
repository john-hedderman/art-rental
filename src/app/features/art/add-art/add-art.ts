import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Art, Artist, ButtonbarData, HeaderData, Job } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import { OPERATION_SUCCESS, OPERATION_FAILURE } from '../../../shared/constants';

@Component({
  selector: 'app-add-art',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, Buttonbar],
  templateUrl: './add-art.html',
  styleUrl: './add-art.scss',
  standalone: true,
})
export class AddArt implements OnInit {
  goBack = () => {
    if (this.editMode) {
      this.router.navigate(['/art', this.artId]);
    } else {
      this.router.navigate(['/art', 'list']);
    }
  };
  goToArtList = () => {
    this.router.navigate(['/art', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Art',
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToArtListLink',
        label: 'Art list',
        routerLink: '/art/list',
        linkClass: '',
        clickHandler: this.goToArtList,
      },
    ],
  };

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

  editObj: Art = {} as Art;
  editMode = false;

  artForm!: FormGroup;
  submitted = false;

  artId = '';

  saveStatus = '';

  artists$: Observable<Artist[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  async onSubmit() {
    let success = 'Save succeeded';
    const failure = 'Save failed';
    const statusReset = { status: '', success: '', failure: '' };
    this.submitted = true;
    if (this.artForm.valid) {
      this.artForm.value.artist_id = parseInt(this.artForm.value.artist_id);
      this.artForm.value.job_id = parseInt(this.artForm.value.job_id);
      if (this.editMode) {
        success = 'Changes saved';
        this.saveStatus = await this.saveDocument(this.artForm.value);
        this.operationsService.setStatus({ status: this.saveStatus, success, failure });
        setTimeout(() => {
          this.operationsService.setStatus(statusReset);
        }, 2000);
      } else {
        this.artForm.value.art_id = Date.now();
        this.saveStatus = await this.saveDocument(this.artForm.value);
        this.operationsService.setStatus({ status: this.saveStatus, success, failure });
        setTimeout(() => {
          this.operationsService.setStatus(statusReset);
        }, 2000);
        this.resetForm();
      }
      if (this.saveStatus === OPERATION_SUCCESS) {
        this.dataService.load('art').subscribe((art) => this.dataService.art$.next(art));
      }
    }
  }

  async saveDocument(artData: any): Promise<string> {
    const collectionName = Collections.Art;
    let result = OPERATION_SUCCESS;
    try {
      let returnData;
      if (this.editMode) {
        returnData = await this.dataService.saveDocument(
          artData,
          collectionName,
          artData.art_id,
          'art_id'
        );
      } else {
        returnData = await this.dataService.saveDocument(artData, collectionName);
      }
      if (returnData.modifiedCount === 0) {
        result = OPERATION_FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = OPERATION_FAILURE;
    }
    return result;
  }

  resetForm() {
    if (this.editMode) {
      this.repopulateEditForm();
    } else {
      this.artForm.reset();
    }
    this.submitted = false;
  }

  repopulateEditForm() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artForm.get('art_id')?.setValue(this.editObj.art_id);
    this.artForm.get('title')?.setValue(this.editObj.title);
    this.artForm.get('file_name')?.setValue(this.editObj.file_name);
    this.artForm.get('full_size_image_url')?.setValue(this.editObj.full_size_image_url);
    this.artForm.get('artist_id')?.setValue(this.editObj.artist_id);
    this.artForm.get('job_id')?.setValue(this.editObj.job_id);
    this.artForm.get('tags')?.setValue(this.editObj.tags);
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
      this.headerData.headerTitle = 'Update Art';
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
    this.artForm = this.fb.group({
      art_id: [null],
      title: [''],
      file_name: [''],
      full_size_image_url: [''],
      artist_id: [null],
      job_id: [null],
      tags: [''],
    });

    this.artId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.artId) {
      this.editMode = true;
      this.http
        .get<Art[]>(`http://localhost:3000/data/art/${this.artId}?recordId=art_id`)
        .subscribe((art) => {
          if (art && art.length === 1) {
            this.editObj = art[0];
            if (this.editObj) {
              this.repopulateEditForm();
            }
          }
        });
    } else {
      this.editMode = false;
    }
  }
}
