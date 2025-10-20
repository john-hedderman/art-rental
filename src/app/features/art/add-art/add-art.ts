import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Artist, HeaderData, Job } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';

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
    headerButtons: [
      {
        id: 'goToArtListBtn',
        label: 'Art list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToArtList,
      },
    ],
  };

  artForm!: FormGroup;
  submitted = false;
  art_id!: number;

  artists$: Observable<Artist[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  onSubmit() {
    this.submitted = true;
    if (this.artForm.valid) {
      this.artForm.value.art_id = Date.now();
      this.artForm.value.artist_id = parseInt(this.artForm.value.artist_id);
      this.artForm.value.job_id = parseInt(this.artForm.value.job_id);
      this.save(this.artForm.value);
      this.resetForm();
    }
  }

  save(artData: any) {
    const collectionName = Collections.Art;
    this.dataService.save(artData, collectionName);
  }

  resetForm() {
    this.artForm.reset();
    this.submitted = false;
  }

  constructor(private router: Router, private dataService: DataService, private fb: FormBuilder) {
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
      art_id: this.art_id,
      title: [''],
      file_name: [''],
      full_size_image_url: [''],
      artist_id: [null],
      job_id: [null],
      tags: [''],
    });
  }
}
