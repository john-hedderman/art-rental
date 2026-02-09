import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
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

import { IArt, IArtist, IClient, Job, Site } from '../../../model/models';
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
export class JobCard implements OnInit, AfterViewInit, OnDestroy {
  @Input() job_id: number | undefined;
  @Input() cardData: any = {
    clickHandler: null
  };
  @Input() selectedArtistId: string | undefined;
  @Input() searchArtString$!: Observable<string>;
  @Input() artistId$!: Observable<string>;

  cardFooterContent = '';

  job: Job | undefined;

  artwork: IArt[] = [];
  artwork$!: Observable<IArt[]>;

  private readonly destroy$ = new Subject<void>();

  readonly WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;

  trackByArtId(art: IArt) {
    return art.art_id;
  }

  onDragEnter(event: DragEvent) {
    const el = this.elemRef.nativeElement;
    if (event.dataTransfer?.types[0] === 'text/plain') {
      el.querySelector('.ar-job-card__content')?.classList.add('droppable');
      event.preventDefault();
    }
  }

  onDragOver(event: DragEvent) {
    if (event.dataTransfer?.types[0] === 'text/plain') {
      event.preventDefault();
    }
  }

  onDragLeave(event: DragEvent) {
    const el = this.elemRef.nativeElement;
    const targetEl = event.relatedTarget as EventTarget as Element;
    if (targetEl?.closest && targetEl.closest('app-job-card') !== el) {
      el.querySelector('.ar-job-card__content')?.classList.remove('droppable');
    }
  }

  onDrop(event: DragEvent) {
    const el = this.elemRef.nativeElement;
    el.querySelector('.ar-job-card__content')?.classList.remove('droppable');

    const artData = event.dataTransfer?.getData('text/plain');
    if (artData) {
      const { art, oldJob } = JSON.parse(artData);
      if (oldJob.job_id === this.job_id) {
        return;
      }
      const newJob = this.job;
      this.artAssignmentService.assignArt(art, oldJob, newJob);
    }
  }

  connectDroppable(el: HTMLElement) {
    el.addEventListener('dragenter', this.onDragEnter.bind(this));
    el.addEventListener('dragover', this.onDragOver.bind(this));
    el.addEventListener('dragleave', this.onDragLeave.bind(this));
    el.addEventListener('drop', this.onDrop.bind(this));
  }

  removeListeners(el: HTMLElement) {
    el.removeEventListener('dragenter', this.onDragEnter.bind(this));
    el.removeEventListener('dragover', this.onDragOver.bind(this));
    el.removeEventListener('dragleave', this.onDragLeave.bind(this));
    el.removeEventListener('drop', this.onDrop.bind(this));
  }

  getDetailedJob(jobs: Job[], clients: IClient[], sites: Site[]): Job {
    const job = jobs.find((job) => job.job_id === this.job_id);
    if (job) {
      job.client = clients.find((client) => client.client_id === job.client_id);
      job.site = sites.find((site) => site.job_id === job.job_id);
      job.art_ids = job.art_ids || [];
      return job;
    } else {
      return {} as Job;
    }
  }

  createCardFooterContent(job: Job): string {
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
    this.getAppData$().subscribe(async ({ art, artists, clients, jobs, sites }) => {
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
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private elemRef: ElementRef,
    private artAssignmentService: ArtAssignmentService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngAfterViewInit(): void {
    this.connectDroppable(this.elemRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.removeListeners(this.elemRef.nativeElement);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
