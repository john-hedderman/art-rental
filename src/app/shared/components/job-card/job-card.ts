import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { combineLatest, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { Art, Artist, Client, Job, Site } from '../../../model/models';
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
    class: 'w-100',
  },
})
export class JobCard implements OnInit, AfterViewInit, OnDestroy {
  @Input() job_id: number | undefined;
  @Input() cardData: any = {
    clickHandler: null,
  };
  @Input() selectedArtistId: string | undefined;
  @Input() searchArtString$: Observable<string> | undefined;
  @Input() artistId$!: Observable<string>;

  job_name = '';

  job: Job | undefined;

  art: Art[] = [];
  filteredArt: Art[] = [];
  artistIds: string[] = [];

  artwork$: Observable<Art[]> = of([]);

  private readonly destroy$ = new Subject<void>();

  readonly WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;

  trackByArtId(art: Art) {
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

  init() {
    this.getCombinedData$().subscribe(({ art, artists, clients, jobs, sites }) => {
      const job = jobs.find((job) => job.job_id === this.job_id);
      if (job) {
        job.client = clients.find((client) => client.client_id === job.client_id);
        job.site = sites.find((site) => site.job_id === job.job_id);
        this.job = job;
        if (!this.job.art_ids) {
          this.job.art_ids = [];
        }

        const client = this.job?.client?.name || 'client TBD';
        const site = this.job?.site?.name || 'site TBD';
        this.job_name =
          this.job?.job_number === Const.WAREHOUSE_JOB_NUMBER
            ? `${Const.WAREHOUSE_SITE_NAME}`
            : `${this.job?.job_number}: ${client}, ${site}`;
      }

      const artwork = art
        .filter((piece) => piece.job_id === this.job_id)
        .map((piece) => {
          piece.artist = artists.find((artist) => artist.artist_id === piece.artist_id);
          return piece;
        });

      if (this.searchArtString$) {
        // Warehouse
        this.artwork$ = combineLatest({
          artwork: of(artwork),
          searchTerm: this.searchArtString$,
          artist: this.artistId$,
        }).pipe(
          takeUntil(this.destroy$),
          switchMap(({ artwork, searchTerm, artist }) => {
            if (searchTerm) {
              return of({
                artwork: artwork.filter(
                  (art) =>
                    art.title.toLowerCase().includes(searchTerm) ||
                    art.artist?.name.toLowerCase().includes(searchTerm),
                ),
                artist,
              });
            }
            return of({ artwork, artist });
          }),
          switchMap(({ artwork, artist }) => {
            if (artist) {
              const artByArtist = artwork.filter(
                (art) => art.artist?.artist_id.toString() === artist,
              );
              return of(artByArtist);
            }
            return of(artwork);
          }),
        );
      } else {
        // A job - no filtering of content at this time
        this.artwork$ = of(artwork);
      }

      this.art = artwork;
      this.filteredArt = [...artwork];
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
    }).pipe(takeUntil(this.destroy$));
  }

  constructor(
    private elemRef: ElementRef,
    private artAssignmentService: ArtAssignmentService,
    private dataService: DataService,
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
