import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil
} from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { IArt, IArtist, IClient, IJob, ISite } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { JobCard } from '../../../shared/components/job-card/job-card';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { ArtAssignmentService } from '../../../service/art-assignment-service';

@Component({
  selector: 'app-jobs-no-drag-list',
  imports: [FormsModule, PageHeader, JobCard, PageFooter, ReactiveFormsModule],
  templateUrl: './jobs-no-drag-list.html',
  styleUrl: './jobs-no-drag-list.scss',
  standalone: true
})
export class JobsNoDragList implements OnInit, OnDestroy {
  goToAddJob = () => {
    this.router.navigate(['/jobs', 'add']);
  };

  assignButton = new ActionButton(
    'assignBtn',
    Msgs.ASSIGN_ART_BUTTON_LABEL,
    'button',
    'btn btn-primary ms-3',
    true,
    null,
    null,
    this.assignArtToJob.bind(this)
  );

  artDetailButton = new ActionButton(
    'artDetailBtn',
    'Art Detail',
    'button',
    'btn btn-primary ms-3',
    true,
    null,
    null,
    this.goToArtDetail.bind(this)
  );

  jobDetailButton = new ActionButton(
    'jobDetailBtn',
    'Job Detail',
    'button',
    'btn btn-primary ms-3',
    true,
    null,
    null,
    this.goToJobDetail.bind(this)
  );

  headerData = new HeaderActions('job-list', 'Jobs', [], []);
  footerData = new FooterActions([
    new AddButton('Add Job', this.goToAddJob),
    this.assignButton,
    this.artDetailButton,
    this.jobDetailButton
  ]);

  private readonly destroy$ = new Subject<void>();

  art$: Observable<IArt[]> | undefined;
  jobs$: Observable<IJob[]> | undefined;

  jobs: IJob[] = [];
  warehouseJob: IJob | undefined;
  filteredJobs: IJob[] = [];

  selectedClientId = 'All';
  clients: IClient[] = [];
  selectedSiteId = 'All';
  sites: ISite[] = [];
  filteredSites: ISite[] = [];
  artists: IArtist[] = [];

  WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;
  SITE_TBD_ID = Const.SITE_TBD_ID;

  searchArtControl: FormControl = new FormControl('');
  searchArtString$!: Observable<string>;
  searchArtStringAll$!: Observable<string>;

  selectArtistControl: FormControl = new FormControl('');
  artistId$!: Observable<string>;
  artistIdAll$!: Observable<string>;

  isSelectedJob = false;

  selectedArt: IArt | undefined;
  selectedJob: IJob | undefined;

  assignArtToJob() {
    if (this.selectedArt !== undefined && this.selectedJob !== undefined) {
      let oldJob = this.jobs.find((job) => {
        return job.art_ids.indexOf(this.selectedArt!.art_id) !== -1;
      });
      if (!oldJob) {
        if (this.warehouseJob?.art_ids.indexOf(this.selectedArt.art_id) !== -1) {
          oldJob = this.warehouseJob;
        }
      }
      this.artAssignmentService.assignArt(this.selectedArt, oldJob, this.selectedJob);
    }
  }

  goToArtDetail() {
    this.router.navigate(['/art', this.selectedArt?.art_id]);
  }

  goToJobDetail() {
    this.router.navigate(['/jobs', this.selectedJob?.job_id]);
  }

  onSelectClient() {
    if (this.selectedClientId === 'All') {
      this.filteredSites = this.sites.filter((site) => site.site_id !== Const.WAREHOUSE_SITE_ID);
    } else {
      this.filteredSites = this.sites.filter((site) => site.client_id === +this.selectedClientId);
      if (this.selectedSiteId !== 'All' && +this.selectedSiteId !== Const.SITE_TBD_ID) {
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

  trackByArtistId(artist: IArtist) {
    return artist.artist_id;
  }

  trackByJobId(job: IJob) {
    return job.job_id;
  }

  trackByClientId(client: IClient) {
    return client.client_id;
  }

  trackBySiteId(site: ISite) {
    return site.site_id;
  }

  init() {
    this.subscribeToActiveAssignment();
    this.getCombinedData$().subscribe(({ art, artists, clients, jobs, sites }) => {
      this.artists = artists;
      this.clients = clients;
      this.sites = sites.filter((site) => site.site_id !== Const.SITE_TBD_ID);

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
      const warehouseJobs = jobs.filter((job) => job.job_id === Const.WAREHOUSE_JOB_ID);
      this.warehouseJob = warehouseJobs ? warehouseJobs[0] : undefined;
      this.jobs$ = of(validJobs);
      this.onSelectClient();
    });

    this.searchArtString$ = this.searchArtControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );
    this.searchArtStringAll$ = of('');

    this.artistId$ = this.selectArtistControl.valueChanges.pipe(
      startWith(this.selectArtistControl.value || '')
    );
    this.artistIdAll$ = of('');
  }

  getCombinedData$(): Observable<{
    art: IArt[];
    artists: IArtist[];
    clients: IClient[];
    jobs: IJob[];
    sites: ISite[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  subscribeToActiveAssignment() {
    this.artAssignmentService.activeArtAssignmentSelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        this.selectedArt = this.artAssignmentService.selectedArt;
        this.selectedJob = this.artAssignmentService.selectedJob;
        this.assignButton.disabled = !!!this.selectedArt || !!!this.selectedJob; // disable Assign button unless both art and a job are selected
        if (this.selectedJob && this.selectedJob.job_id === Const.WAREHOUSE_JOB_ID) {
          this.assignButton.label = Msgs.UNASSIGN_ART_BUTTON_LABEL;
        } else {
          this.assignButton.label = Msgs.ASSIGN_ART_BUTTON_LABEL;
        }
        this.artDetailButton.disabled = !!!this.selectedArt || !!this.selectedJob;
        this.jobDetailButton.disabled = !!!this.selectedJob || !!this.selectedArt;
      });
  }

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private artAssignmentService: ArtAssignmentService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.artAssignmentService.clearHighlights();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
