import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { IArt, IJob } from '../model/models';
import { DataService } from './data-service';
import * as Const from '../constants';
import * as Msgs from '../shared/strings';
import { Collections } from '../shared/enums/collections';
import { Util } from '../shared/util/util';
import { MessagesService } from './messages-service';

@Injectable({
  providedIn: 'root'
})
export class ArtAssignmentService implements OnDestroy {
  saveStatus: string = '';

  private readonly destroy$ = new Subject<void>();

  public selectedArt: IArt | undefined;
  public selectedJob: IJob | undefined;

  // making this signal's "equal" function return false allows emission of the same value twice, to enable unhighlighting something highlighted upon second selection
  private _activeArtAssignmentSelections = signal<{
    art: IArt | undefined;
    job: IJob | undefined;
    assignedJob?: IJob | undefined;
  }>(
    {
      art: undefined,
      job: undefined,
      assignedJob: undefined
    },
    { equal: () => false }
  );
  public activeArtAssignmentSelections$: Observable<any> = toObservable(
    this._activeArtAssignmentSelections
  );

  private _selectedArt = signal<IArt | undefined>(undefined, { equal: () => false });
  public selectedArt$: Observable<IArt | undefined> = toObservable(this._selectedArt);

  private _selectedJob = signal<IJob | undefined>(undefined, { equal: () => false });
  public selectedJob$: Observable<IJob | undefined> = toObservable(this._selectedJob);

  private _assignedArt = signal<{
    art: IArt | undefined;
    oldJob: IJob | undefined;
    newJob: IJob | undefined;
  }>({ art: undefined, oldJob: undefined, newJob: undefined });
  public assignedArt$: Observable<{
    art: IArt | undefined;
    oldJob: IJob | undefined;
    newJob: IJob | undefined;
  }> = toObservable(this._assignedArt);

  public selectArt(art: IArt | undefined, job: IJob | undefined) {
    this.selectedArt = this.selectedArt?.art_id === art?.art_id ? undefined : art;
    this._activeArtAssignmentSelections.set({
      art,
      job: this.selectedJob,
      assignedJob: job
    });
  }

  public selectJob(art: IArt | undefined, job: IJob | undefined) {
    this.selectedJob = this.selectedJob?.job_id === job?.job_id ? undefined : job;
    this._activeArtAssignmentSelections.set({ art: this.selectedArt, job });
  }

  public assignArt(art: IArt | undefined, oldJob: IJob | undefined, newJob: IJob | undefined) {
    this._assignedArt.set({ art, oldJob, newJob });
  }

  async updateArt(art: IArt | undefined, newJob: IJob | undefined): Promise<string> {
    let result = Const.SUCCESS;
    let modifiedArt = { ...art };
    try {
      modifiedArt.job_id = newJob?.job_id;
      delete modifiedArt.artist;
      delete (modifiedArt as any)._id;
      const returnData = await this.dataService.saveDocument(
        modifiedArt,
        Collections.Art,
        modifiedArt.art_id,
        'art_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save art error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateOldJob(art: IArt | undefined, oldJob: IJob | undefined): Promise<string> {
    let result = Const.SUCCESS;
    let modifiedJob = { ...oldJob };
    try {
      const art_ids = modifiedJob.art_ids
        ? modifiedJob.art_ids.filter((art_id) => art_id !== art?.art_id)
        : [];
      modifiedJob = { ...modifiedJob, art_ids };
      delete modifiedJob.art;
      delete modifiedJob.client;
      delete modifiedJob.contacts;
      delete modifiedJob.site;
      delete (modifiedJob as any)._id;
      const returnData = await this.dataService.saveDocument(
        modifiedJob,
        Collections.Jobs,
        modifiedJob.job_id,
        'job_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateNewJob(art: IArt, newJob: IJob): Promise<string> {
    let result = Const.SUCCESS;
    let modifiedJob: IJob = { ...newJob };
    try {
      const art_ids = modifiedJob.art_ids || [];
      art_ids.push(art.art_id);
      modifiedJob = { ...modifiedJob, art_ids };
      delete modifiedJob.art;
      delete modifiedJob.client;
      delete modifiedJob.contacts;
      delete modifiedJob.site;
      delete (modifiedJob as any)._id;
      const returnData = await this.dataService.saveDocument(
        modifiedJob,
        Collections.Jobs,
        modifiedJob.job_id,
        'job_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save job error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async save(art: IArt, oldJob: IJob, newJob: IJob): Promise<string> {
    const artStatus = await this.updateArt(art, newJob);
    const oldJobStatus = await this.updateOldJob(art, oldJob);
    const newJobStatus = await this.updateNewJob(art, newJob);
    return Util.jobResult([artStatus, oldJobStatus, newJobStatus]);
  }

  postSave(entity: string) {
    this.messagesService.showStatus(
      this.saveStatus,
      Util.replaceTokens(Msgs.SAVED, { entity }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity })
    );
    this.messagesService.clearStatus();
  }

  clearHighlights() {
    // unhighlight selected art and job
    this.selectArt(undefined, undefined);
    this.selectJob(undefined, undefined);
  }

  subscribeToSelectedArt() {
    this.selectedArt$.pipe(takeUntil(this.destroy$)).subscribe((art) => {
      // highlight the selected art; unhighlight it if you select it again
      this.selectedArt = art === this.selectedArt ? undefined : art;
    });
  }

  subscribeToSelectedJob() {
    this.selectedJob$.pipe(takeUntil(this.destroy$)).subscribe((job) => {
      // highlight the selected job; unhighlight it if you select it again
      this.selectedJob = job === this.selectedJob ? undefined : job;
    });
  }

  subscribeToAssignedArt() {
    this.assignedArt$.pipe(takeUntil(this.destroy$)).subscribe(async (data) => {
      let { art, oldJob, newJob } = data;
      oldJob = oldJob || ({ job_id: Const.NO_JOB } as IJob);
      newJob = newJob || ({ job_id: Const.NO_JOB } as IJob);
      if (art?.art_id != undefined && oldJob?.job_id != undefined && newJob?.job_id != undefined) {
        this.saveStatus = await this.save(art, oldJob, newJob);
        this.postSave('job');
        this.dataService.reloadData(['art', 'artists', 'jobs']);
        this.clearHighlights();
      }
    });
  }

  constructor(
    private dataService: DataService,
    private messagesService: MessagesService
  ) {
    this.subscribeToSelectedArt();
    this.subscribeToSelectedJob();
    this.subscribeToAssignedArt();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
