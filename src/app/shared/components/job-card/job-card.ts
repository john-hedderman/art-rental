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
import { AsyncPipe } from '@angular/common';

import { Art, Job, Site } from '../../../model/models';
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

  job_name = '';

  job: Job | undefined;

  art$: Observable<Art[] | undefined> | undefined;

  private readonly destroy$ = new Subject<void>();

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
    if (targetEl.closest && targetEl.closest('app-job-card') !== el) {
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
    this.getCombinedData$().subscribe(({ art, jobs, sites }) => {
      const job = jobs.find((job) => job.job_id === this.job_id);
      if (job) {
        job.site = sites.find((site) => site.job_id === job.job_id);
        this.job = job;
        this.job_name =
          this.job?.job_number === Const.WAREHOUSE_JOB_NUMBER
            ? `${Const.WAREHOUSE_JOB_NUMBER} (${Const.WAREHOUSE_SITE_NAME})`
            : `${this.job?.job_number}: ${this.job?.site?.name}`;
      }
      const artwork = art.filter((piece) => piece.job_id === this.job_id);
      this.art$ = of(artwork);
      this.cdr.detectChanges();
    });
  }

  getCombinedData$(): Observable<{
    art: Art[];
    jobs: Job[];
    sites: Site[];
  }> {
    return combineLatest({
      art: this.dataService.art$,
      jobs: this.dataService.jobs$,
      sites: this.dataService.sites$,
    }).pipe(takeUntil(this.destroy$));
  }

  constructor(
    private elemRef: ElementRef,
    private artAssignmentService: ArtAssignmentService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
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
