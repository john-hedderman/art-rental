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
    'Delay Clear Op Status': emptyProps(),

    'General Failure': props<{ errorMessage: string }>()
  }
});
