import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Art, Artist, HeaderData, Job } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-art',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe],
  templateUrl: './add-art.html',
  styleUrl: './add-art.scss',
  standalone: true,
})
export class AddArt implements OnInit {
  goToArtList = () => {
    this.router.navigate(['/art', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Art',
    headerButtons: [],
    headerLinks: [],
  };

  editObj: Art = {} as Art;
  editMode = false;

  artForm!: FormGroup;
  submitted = false;
  art_id!: number;

  artId = '';

  artists$: Observable<Artist[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  saveStatus = '';
  OPERATION_SUCCESS = 'success';
  OPERATION_FAILURE = 'failure';

  async onSubmit() {
    this.submitted = true;
    if (this.artForm.valid) {
      this.artForm.value.artist_id = parseInt(this.artForm.value.artist_id);
      this.artForm.value.job_id = parseInt(this.artForm.value.job_id);
      if (this.editMode) {
        this.saveStatus = await this.replaceDocument(this.artForm.value);
      } else {
        this.artForm.value.art_id = Date.now();
        this.saveDocument(this.artForm.value);
        this.resetForm();
      }
    }
  }

  saveDocument(artData: any) {
    const collectionName = Collections.Art;
    this.dataService.saveDocument(artData, collectionName);
  }

  async replaceDocument(artData: any): Promise<string> {
    const collectionName = Collections.Art;
    let result = this.OPERATION_SUCCESS;
    try {
      const returnData = await this.dataService.replaceDocument(
        artData,
        collectionName,
        artData.art_id,
        'art_id'
      );
      if (returnData.modifiedCount === 0) {
        result = this.OPERATION_FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = this.OPERATION_FAILURE;
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
    // this also effectively touches the form fields, so those with prepopulated data and that
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
    private http: HttpClient
  ) {
    const segments = this.route.snapshot.url.map((x) => x.path);
    if (segments[segments.length - 1] === 'edit') {
      this.headerData.headerTitle = 'Update Art';
    }
    combineLatest({
      artists: this.dataService.artists$,
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
      sites: this.dataService.sites$,
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
