import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { Art, Artist, Client, Job, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import { JobCard } from '../../../shared/components/job-card/job-card';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { Router } from '@angular/router';
import { ViewFilterService } from '../../../service/view-filter-service';

@Component({
  selector: 'app-job-list',
  imports: [FormsModule, PageHeader, AsyncPipe, JobCard, PageFooter],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
  standalone: true,
})
export class JobList implements OnInit {
  goToAddJob = () => this.router.navigate(['/jobs', 'add']);
  goToJobDetail = (id: number) => this.router.navigate(['/jobs', id]);
  noop = () => {};

  headerData = new HeaderActions('job2-list', 'Jobs2', [], []);
  footerData = new FooterActions([new AddButton('Add Job', this.goToAddJob)]);

  art$: Observable<Art[]> | undefined;
  jobs$: Observable<Job[]> | undefined;

  jobs: Job[] = [];
  filteredJobs: Job[] = [];

  selectedClientId = 'All';
  clients: Client[] = [];
  selectedSiteId = 'All';
  sites: Site[] = [];
  filteredSites: Site[] = [];
  selectedArtistId = 'All';
  artists: Artist[] = [];

  WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;
  TBD = Const.TBD;

  onSelectClient() {
    if (this.selectedClientId === 'All') {
      this.filteredSites = this.sites;
    } else {
      this.filteredSites = this.sites.filter((site) => site.client_id === +this.selectedClientId);
      if (this.selectedSiteId !== 'All' && +this.selectedSiteId !== Const.TBD) {
        this.selectedSiteId = 'All';
      }
    }
    this.filterJobs();
  }

  filterJobs() {
    if (this.selectedClientId === 'All' && this.selectedSiteId === 'All') {
      this.filteredJobs = this.jobs;
    } else if (this.selectedClientId === 'All' && this.selectedSiteId !== 'All') {
      this.filteredJobs = this.jobs.filter((job) => job.site_id === +this.selectedSiteId);
    } else if (this.selectedClientId !== 'All' && this.selectedSiteId === 'All') {
      this.filteredJobs = this.jobs.filter((job) => job.client_id === +this.selectedClientId);
    } else {
      this.filteredJobs = this.jobs.filter(
        (job) => job.client_id === +this.selectedClientId && job.site_id === +this.selectedSiteId
      );
    }
  }

  filterArt() {
    this.viewFilterService.selectArtistId(this.selectedArtistId);
  }

  trackByArtistId(artist: Artist) {
    return artist.artist_id;
  }

  trackByJobId(job: Job) {
    return job.job_id;
  }

  trackByClientId(client: Client) {
    return client.client_id;
  }

  trackBySiteId(site: Site) {
    return site.site_id;
  }

  init() {
    this.getCombinedData$().subscribe(({ art, artists, clients, jobs, sites }) => {
      this.artists = artists;
      this.clients = clients;
      this.sites = sites.filter((site) => site.site_id !== Const.TBD);

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
      this.jobs = validJobs;
      this.jobs$ = of(validJobs);
      this.onSelectClient();
      this.filterArt();
    });
  }

  getCombinedData$(): Observable<{
    art: Art[];
    artists: Artist[];
    clients: Client[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    }).pipe(take(1));
  }

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private viewFilterService: ViewFilterService
  ) {}

  ngOnInit(): void {
    this.init();
  }
}
