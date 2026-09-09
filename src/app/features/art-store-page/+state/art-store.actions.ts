import { createActionGroup, props } from '@ngrx/store';
import { IArt, IJob } from '../../../model/models';

export const ArtActions = createActionGroup({
  source: 'Art',
  events: {
    'Delete Art': props<{ art: IArt; job: IJob; artId: number }>(),
    'Delete Art Success': props<{ job: IJob; artId: number; result: string }>(),
    'Delete Art Update Job': props<{ job: IJob }>(),
    'Delete Art Update Job Success': props<{ job: IJob; result: string }>(),

    'Add Or Edit Art': props<{
      isEdit: boolean;
      artItem: IArt;
      oldJobItem: IJob;
      newJobItem: IJob;
    }>(),
    'Add Art Success': props<{ artItem: IArt; oldJobItem: IJob; newJobItem: IJob }>(),
    'Edit Art Success': props<{ artItem: IArt; oldJobItem: IJob; newJobItem: IJob }>(),
    'Add Or Edit Art Update New Job': props<{
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
