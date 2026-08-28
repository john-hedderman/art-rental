import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IArt, IArtist, IClient, IContact, IJob, ISite, ITag } from '../../model/models';
import { AppData } from './core-state';

export const CoreDataActions = createActionGroup({
  source: 'Core',
  events: {
    'Load All Data': props<{ refresh: boolean }>(),
    'Load All Data Success': props<{ data: AppData }>(),

    'Load Art': props<{ refresh: boolean }>(),
    'Load Art Success': props<{ artItems: IArt[] }>(),

    'Load Artists': props<{ refresh: boolean }>(),
    'Load Artists Success': props<{ artistItems: IArtist[] }>(),

    'Load Clients': props<{ refresh: boolean }>(),
    'Load Clients Success': props<{ clientItems: IClient[] }>(),

    'Load Contacts': props<{ refresh: boolean }>(),
    'Load Contacts Success': props<{ contactItems: IContact[] }>(),

    'Load Jobs': props<{ refresh: boolean }>(),
    'Load Jobs Success': props<{ jobItems: IJob[] }>(),

    'Load Sites': props<{ refresh: boolean }>(),
    'Load Sites Success': props<{ siteItems: ISite[] }>(),

    'Load Tags': props<{ refresh: boolean }>(),
    'Load Tags Success': props<{ tagItems: ITag[] }>(),

    'Load Data Failure': props<{ errorMessage: string }>(),

    'Clear Op Status': emptyProps(),

    'General Failure': props<{ errorMessage: string }>()
  }
});

export const ArtActions = createActionGroup({
  source: 'Art',
  events: {
    'Delete Art Item': props<{ art: IArt; job: IJob; artId: number }>(),
    'Delete Art Item Success': props<{ job: IJob; artId: number; result: string }>(),
    'Delete Art Item Failure': props<{ errorMessage: string }>(),
    'Delete Art Item Update Job': props<{
      job: IJob;
      collection: any;
      idField: string;
      jobId: number;
    }>(),
    'Delete Art Item Update Job Success': props<{ job: IJob; result: string }>(),
    'Delete Art Item Update Job Failure': props<{ errorMessage: string }>(),

    'Add Or Edit Art': props<{
      isEdit: boolean;
      artItem: IArt;
      oldJobItem: IJob;
      newJobItem: IJob;
    }>(),
    'Add Art Success': props<{ artItem: IArt; oldJobItem: IJob; newJobItem: IJob }>(),
    'Edit Art Success': props<{ artItem: IArt; oldJobItem: IJob; newJobItem: IJob }>(),
    'Add or Edit Art Update New Job': props<{
      artItem: IArt;
      oldJobItem: IJob;
      newJobItem: IJob;
    }>(),
    'Add or Edit Art Update New Job Success': props<{
      oldJobItem: IJob;
      newJobItem: IJob;
    }>(),
    'Edit Art Update Old Job': props<{ artItem: IArt; oldJobItem: IJob; newJobItem: IJob }>(),
    'Edit Art Update Old Job Success': props<{
      artItem: IArt;
      oldJobItem: IJob;
      newJobItem: IJob;
    }>()
  }
});
