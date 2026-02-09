import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';

import { Art, IArtist, Job } from '../../../model/models';
import * as Const from '../../../constants';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-art-thumbnail-card',
  imports: [],
  templateUrl: './art-thumbnail-card.html',
  styleUrl: './art-thumbnail-card.scss',
  standalone: true
})
export class ArtThumbnailCard implements OnInit, OnDestroy, AfterViewInit {
  @Input() job_id: number | undefined;
  @Input() art_id: number = 0;
  @Input() draggable = true;

  art: Art | undefined;
  job: Job | undefined;

  private readonly destroy$ = new Subject<void>();

  ART_THUMBNAIL_PATH = Const.ART_THUMBNAIL_PATH;

  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      let data;
      if (this.art && this.job) {
        data = { art: this.art, oldJob: this.job };
      } else {
        data = { art: {}, oldJob: {} };
      }
      event.dataTransfer?.setData('text/plain', JSON.stringify(data));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(event: DragEvent) {}

  connectDrag(el: HTMLElement) {
    el.addEventListener('dragstart', this.onDragStart.bind(this));
    el.addEventListener('dragend', this.onDragEnd.bind(this));
  }

  removeListeners(el: HTMLElement) {
    el.removeEventListener('dragstart', this.onDragStart.bind(this));
    el.removeEventListener('dragend', this.onDragEnd.bind(this));
  }

  init() {
    this.getCombinedData$().subscribe(({ art, artists, jobs }) => {
      this.art = art.find((piece) => piece.art_id === this.art_id);
      if (this.art) {
        const artist = artists.find((artist) => artist.artist_id === this.art?.artist_id);
        this.art = { ...this.art, artist };
      }
      this.job = jobs.find((job) => job.job_id === this.job_id);
    });
  }

  getCombinedData$(): Observable<{
    art: Art[];
    artists: IArtist[];
    jobs: Job[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      jobs: this.dataService.jobs$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  constructor(
    private elemRef: ElementRef,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngAfterViewInit(): void {
    if (this.draggable) {
      this.connectDrag(this.elemRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.draggable) {
      this.removeListeners(this.elemRef.nativeElement);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
