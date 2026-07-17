import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  combineLatest,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { IArt, IArtist, IClient, IJob, ISite } from '../../../model/models';
import { ArtThumbnailCard } from '../art-thumbnail-card/art-thumbnail-card';
import * as Const from '../../../constants';
import { ArtAssignmentService } from '../../../service/art-assignment-service';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-job-card',
  imports: [ArtThumbnailCard, AsyncPipe],
  templateUrl: './job-card.html',
  styleUrl: './job-card.scss',
  standalone: true,
  host: {
    class: 'w-100'
  }
})
export class JobCard implements OnInit, OnDestroy {
  @Input() job_id: number | undefined;
  @Input() cardData: any = {
    clickHandler: null
  };
  @Input() selectedArtistId: string | undefined;
  @Input() searchArtString$!: Observable<string>;
  @Input() artistId$!: Observable<string>;
  @Input() isSelectedJob = false;

  @ViewChild(ArtThumbnailCard) artThumbnailCard!: ArtThumbnailCard;

  cardFooterContent = '';

  jobs: IJob[] = [];
  job: IJob | undefined;

  artwork: IArt[] = [];
  artwork$!: Observable<IArt[]>;

  private readonly destroy$ = new Subject<void>();

  readonly WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;

  selectedJob = 0;
  selectedArt = 0;

  onClickArt(event: Event, art_id: number) {
    event.stopPropagation(); // only select the art thumbnail, not the enclosing job card too
    // only mark the art as the assignment source if it is not already assigned to the selected target job
    if (this.job_id !== this.artAssignmentService.selectedJob) {
      this.artAssignmentService.selectArt(art_id);
    }
  }

  onClickJob(event: Event) {
    // only mark this job as the assignment target if the currently selected art is not already assigned to this job
    const containedArtIds = this.artwork.map((a) => a.art_id);
    if (containedArtIds.indexOf(this.artAssignmentService.selectedArt) === -1) {
      this.artAssignmentService.selectJob(this.job_id!);
    }
  }

  trackByArtId(art: IArt) {
    return art.art_id;
  }

  getDetailedJob(jobs: IJob[], clients: IClient[], sites: ISite[]): IJob {
    const job = jobs.find((job) => job.job_id === this.job_id);
    if (job) {
      job.client = clients.find((client) => client.client_id === job.client_id);
      job.site = sites.find((site) => site.job_id === job.job_id);
      job.art_ids = job.art_ids || [];
      return job;
    } else {
      return {} as IJob;
    }
  }

  createCardFooterContent(job: IJob): string {
    const client = job.client?.name || 'client TBD';
    const site = job.site?.name || 'site TBD';
    return job.job_number === Const.WAREHOUSE_JOB_NUMBER
      ? `${Const.WAREHOUSE_SITE_NAME}`
      : `${job.job_number}: ${client}, ${site}`;
  }

  getSearchArtString(): string {
    let returnVal;
    if (this.job_id === this.WAREHOUSE_JOB_ID) {
      const searchArtControl = document.getElementById('searchArt') as HTMLInputElement;
      returnVal = searchArtControl.value.trim();
    }
    return returnVal || '';
  }

  getSelectArtistId(): string {
    let returnVal;
    if (this.job_id === this.WAREHOUSE_JOB_ID) {
      const selectArtistControl = document.getElementById('selectArtist') as HTMLSelectElement;
      returnVal = selectArtistControl.value.trim();
    }
    return returnVal || '';
  }

  getFilteredArt$(artwork: IArt[]): Observable<IArt[]> {
    return combineLatest({
      searchTerm: this.searchArtString$,
      artist: this.artistId$
    }).pipe(
      takeUntil(this.destroy$),
      switchMap(({ searchTerm, artist }) => {
        const searchTermString = this.getSearchArtString();
        const artistIdString = this.getSelectArtistId();
        let art = artwork;
        if (searchTermString || artistIdString) {
          art = artwork.filter((art: IArt) => {
            const titleMatch = art.title.toLowerCase().includes(searchTermString);
            const artistMatch = artistIdString === '' || art.artist?.artist_id === +artistIdString;
            return titleMatch && artistMatch;
          });
        }
        if (artist) {
          art = art.filter((art) => art.artist?.artist_id.toString() === artist);
        }
        return of(art);
      })
    );
  }

  getDetailedArtwork(art: IArt[], artists: IArtist[]): IArt[] {
    return art
      .filter((piece) => piece.job_id === this.job_id)
      .map((piece) => {
        piece.artist = artists.find((artist) => artist.artist_id === piece.artist_id);
        return piece;
      });
  }

  async init() {
    this.subscribeToAssignmentSelections();
    this.getAppData$().subscribe(async ({ art, artists, clients, jobs, sites }) => {
      this.jobs = jobs;
      this.job = this.getDetailedJob(jobs, clients, sites);
      this.cardFooterContent = this.createCardFooterContent(this.job);
      this.artwork = this.getDetailedArtwork(art, artists);
      this.artwork$ = this.getFilteredArt$(this.artwork);
    });
  }

  getAppData$(): Observable<{
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

  subscribeToAssignmentSelections() {
    this.artAssignmentService.activeArtAssignmentSelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (assignmentSelections: { artId: number; jobId: number }) => {
        this.selectedArt = this.artAssignmentService.selectedArt;
        this.selectedJob = this.artAssignmentService.selectedJob;
      });
  }

  constructor(
    private elemRef: ElementRef,
    private artAssignmentService: ArtAssignmentService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
