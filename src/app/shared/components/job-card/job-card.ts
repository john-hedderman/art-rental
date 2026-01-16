import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';

import { Art, Client, Job, Site } from '../../../model/models';
import { ArtThumbnailCard } from '../art-thumbnail-card/art-thumbnail-card';
import * as Const from '../../../constants';
import { ArtAssignmentService } from '../../../service/art-assignment-service';
import { DataService } from '../../../service/data-service';
import { ViewFilterService } from '../../../service/view-filter-service';

@Component({
  selector: 'app-job-card',
  imports: [ArtThumbnailCard],
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

  job_name = '';

  job: Job | undefined;

  art: Art[] = [];
  filteredArt: Art[] = [];
  artistIds: string[] = [];

  art$: Observable<Art[]> | undefined;

  private readonly destroy$ = new Subject<void>();

  readonly WAREHOUSE_JOB_ID = Const.WAREHOUSE_JOB_ID;
  readonly WAREHOUSE_SITE_NAME = Const.WAREHOUSE_SITE_NAME;

  filterArt() {
    if (this.selectedArtistId === 'All') {
      this.filteredArt = this.art;
    } else {
      this.filteredArt = this.art.filter((art) => art.artist_id === +this.selectedArtistId!);
    }
  }

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
    this.getCombinedData$().subscribe(({ art, clients, jobs, sites }) => {
      const job = jobs.find((job) => job.job_id === this.job_id);
      if (job) {
        job.site = sites.find((site) => site.job_id === job.job_id);
        this.job = job;
        if (!this.job.art_ids) {
          this.job.art_ids = [];
        }
        job.client = clients.find((client) => client.client_id === job.client_id);

        const client = this.job?.client?.name || 'client TBD';
        const site = this.job?.site?.name || 'site TBD';
        this.job_name =
          this.job?.job_number === Const.WAREHOUSE_JOB_NUMBER
            ? `${Const.WAREHOUSE_SITE_NAME}`
            : `${this.job?.job_number}: ${client}, ${site}`;
      }
      const artwork = art.filter((piece) => piece.job_id === this.job_id);
      this.art$ = of(artwork);
      this.art = artwork;
      this.filteredArt = [...artwork];
      if (this.job_id === Const.WAREHOUSE_JOB_ID) {
        this.filterArt();
      }
      this.cdr.detectChanges();
    });

    if (this.job_id === Const.WAREHOUSE_JOB_ID) {
      this.viewFilterService.artistId$.pipe(takeUntil(this.destroy$)).subscribe((id: string) => {
        this.selectedArtistId = id;
        this.filterArt();
      });
    }
  }

  getCombinedData$(): Observable<{
    art: Art[];
    clients: Client[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      clients: this.dataService.clients$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    }).pipe(takeUntil(this.destroy$));
  }

  constructor(
    private elemRef: ElementRef,
    private artAssignmentService: ArtAssignmentService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private viewFilterService: ViewFilterService
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
