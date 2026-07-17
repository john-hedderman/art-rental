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

  public selectedArt = 0;
  public selectedJob = 0;

  private _activeArtAssignmentSelections = signal<{ artId: number; jobId: number }>(
    {
      artId: 0,
      jobId: 0
    },
    { equal: () => false }
  );
  public activeArtAssignmentSelections$: Observable<any> = toObservable(
    this._activeArtAssignmentSelections
  );

  // making ths signal's "equal" function return false allows emission of the same value twice, to enable unhighlighting something highlighted upon second selection
  private _selectedArt = signal<number>(0, { equal: () => false });
  public selectedArt$: Observable<number> = toObservable(this._selectedArt);

  private _selectedJob = signal<number>(0, { equal: () => false });
  public selectedJob$: Observable<number> = toObservable(this._selectedJob);

  public selectArt(art_id: number) {
    this.selectedArt = this.selectedArt === art_id ? 0 : art_id;
    this._activeArtAssignmentSelections.set({ artId: art_id, jobId: this.selectedJob });
  }

  public selectJob(job_id: number) {
    this.selectedJob = this.selectedJob === job_id ? 0 : job_id;
    this._activeArtAssignmentSelections.set({ artId: this.selectedArt, jobId: job_id });
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

  subscribeToSelectedArt() {
    this.selectedArt$.pipe(takeUntil(this.destroy$)).subscribe((art_id) => {
      // highlight the selected art; unhighlight it if you select it again
      this.selectedArt = art_id === this.selectedArt ? 0 : art_id;
    });
  }

  subscribeToSelectedJob() {
    this.selectedJob$.pipe(takeUntil(this.destroy$)).subscribe((job_id) => {
      // highlight the selected job; unhighlight it if you select it again
      this.selectedJob = job_id === this.selectedJob ? 0 : job_id;
    });
  }

  constructor(
    private dataService: DataService,
    private messagesService: MessagesService
  ) {
    this.subscribeToSelectedArt();
    this.subscribeToSelectedJob();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
