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

  private _assignedArt = signal<any>({ art: {}, oldJob: {}, newJob: {} });
  public assignedArt$: Observable<any> = toObservable(this._assignedArt);

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

  subscribeToAssignedArt() {
    this.assignedArt$.pipe(takeUntil(this.destroy$)).subscribe(async (data) => {
      let { art, oldJob, newJob } = data;
      oldJob = oldJob || { job_id: Const.NO_JOB };
      newJob = newJob || { job_id: Const.NO_JOB };
      if (art?.art_id && oldJob?.job_id != undefined && newJob?.job_id != undefined) {
        this.saveStatus = await this.save(art, oldJob, newJob);
        this.postSave('job');
        this.dataService.reloadData(['art', 'artists', 'jobs']);
      }
    });
  }

  constructor(
    private dataService: DataService,
    private messagesService: MessagesService
  ) {
    this.subscribeToAssignedArt();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
