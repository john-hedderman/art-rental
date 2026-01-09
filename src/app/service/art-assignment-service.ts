import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { Art, Job } from '../model/models';
import { DataService } from './data-service';
import * as Const from '../constants';
import { Collections } from '../shared/enums/collections';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ArtAssignmentService {
  private _assignedArt = signal<any>({ art: {}, oldJob: {}, newJob: {} });
  public assignedArt$: Observable<any> = toObservable(this._assignedArt);

  public assignArt(art: Art | undefined, oldJob: Job | undefined, newJob: Job | undefined) {
    this._assignedArt.set({ art, oldJob, newJob });
  }

  async updateArt(
    art: Art | undefined,
    oldJob: Job | undefined,
    newJob: Job | undefined
  ): Promise<string> {
    if (art?.art_id == undefined || oldJob?.job_id == undefined || newJob?.job_id == undefined) {
      return Const.FAILURE;
    }
    let result = Const.SUCCESS;
    let modifiedArt = { ...art };
    try {
      modifiedArt.job_id = newJob.job_id;
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

  async updateOldJob(art: Art | undefined, oldJob: Job | undefined): Promise<string> {
    if (art?.art_id == undefined || oldJob?.job_id == undefined) {
      return Const.FAILURE;
    }
    let result = Const.SUCCESS;
    let modifiedJob = { ...oldJob };
    try {
      const art_ids = modifiedJob.art_ids.filter((art_id) => art_id !== art.art_id);
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

  async updateNewJob(art: Art, newJob: Job | undefined): Promise<string> {
    if (art.art_id == undefined || newJob?.job_id == undefined) {
      return Const.FAILURE;
    }
    let result = Const.SUCCESS;
    let modifiedJob = { ...newJob };
    try {
      const art_ids = modifiedJob.art_ids;
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

  constructor(private dataService: DataService, private router: Router) {
    this.assignedArt$.pipe(takeUntilDestroyed()).subscribe(async (data) => {
      let { art, oldJob, newJob } = data;
      oldJob = oldJob || { job_id: Const.NO_JOB };
      newJob = newJob || { job_id: Const.NO_JOB };
      if (art?.art_id && oldJob?.job_id != undefined && newJob?.job_id != undefined) {
        const artStatus = await this.updateArt(art, oldJob, newJob);
        const oldJobStatus = await this.updateOldJob(art, oldJob);
        const newJobStatus = await this.updateNewJob(art, newJob);
        this.dataService.reloadData(['art']);
      }
    });
  }
}
