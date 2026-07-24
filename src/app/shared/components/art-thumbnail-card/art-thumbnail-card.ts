import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';

import { IArt, IArtist, IJob } from '../../../model/models';
import * as Const from '../../../constants';
import { DataService } from '../../../service/data-service';
import { ArtAssignmentService } from '../../../service/art-assignment-service';

@Component({
  selector: 'app-art-thumbnail-card',
  imports: [],
  templateUrl: './art-thumbnail-card.html',
  styleUrl: './art-thumbnail-card.scss',
  standalone: true
})
export class ArtThumbnailCard implements OnInit, OnDestroy {
  @Input() job_id: number | undefined;
  @Input() art_id: number = 0;
  @Input() artist_name: string | undefined = '';
  @Input() draggable = true;
  @Input() isSelectedArt = false;

  art: IArt | undefined;
  job: IJob | undefined;

  private readonly destroy$ = new Subject<void>();

  ART_THUMBNAIL_PATH = Const.ART_THUMBNAIL_PATH;

  selectedArt: IArt | undefined;
  selectedJob: IJob | undefined;

  public onArtThumbnailClicked(x: any) {
    console.warn('ArtThumbnailCard, x:', x);
  }

  init() {
    this.subscribeToActiveAssignment();
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
    art: IArt[];
    artists: IArtist[];
    jobs: IJob[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      artists: this.dataService.artists$,
      jobs: this.dataService.jobs$
    }).pipe(takeUntil(this.destroy$), distinctUntilChanged());
  }

  subscribeToActiveAssignment() {
    this.artAssignmentService.activeArtAssignmentSelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        this.selectedArt = this.artAssignmentService.selectedArt;
        this.selectedJob = this.artAssignmentService.selectedJob;
      });
  }

  constructor(
    private elemRef: ElementRef,
    private dataService: DataService,
    private artAssignmentService: ArtAssignmentService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
