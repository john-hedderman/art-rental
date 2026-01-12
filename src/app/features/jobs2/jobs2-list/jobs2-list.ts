import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { Art, Artist, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import { JobCard } from '../../../shared/components/job-card/job-card';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jobs2-list',
  imports: [PageHeader, AsyncPipe, JobCard, PageFooter],
  templateUrl: './jobs2-list.html',
  styleUrl: './jobs2-list.scss',
  standalone: true,
})
export class Jobs2List implements OnInit {
  goToAddJob = () => this.router.navigate(['/jobs', 'add']);
  goToJobDetail = (id: number) => this.router.navigate(['/jobs', id]);
  noop = () => {};

  headerData = new HeaderActions('job2-list', 'Jobs2', [], []);
  footerData = new FooterActions([new AddButton('Add Job', this.goToAddJob)]);

  art$: Observable<Art[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;

  init() {
    this.getCombinedData$().subscribe(({ art, artists, jobs, sites }) => {
      this.art$ = of(art);
      const validJobs = jobs
        .filter((job) => job.job_id !== Const.WAREHOUSE_JOB_ID)
        .map((job) => {
          const site = sites.find((site) => site.site_id === job.site_id);
          if (site) {
            job = { ...job, site };
          }
          const artwork = art
            .filter((piece) => piece.job_id === job.job_id)
            .map((piece) => {
              piece.artist = artists.find((artist) => artist.artist_id === piece.artist_id);
              return piece;
            });
          if (artwork) {
            job = { ...job, art: artwork };
          }
          return job;
        });
      this.jobs$ = of(validJobs);
    });
  }

  getCombinedData$(): Observable<{
    art: Art[];
    artists: Artist[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    }).pipe(take(1));
  }

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.init();
  }
}
