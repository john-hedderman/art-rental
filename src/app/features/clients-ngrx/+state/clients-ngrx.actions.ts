import { createActionGroup, props } from '@ngrx/store';
import { IArtist, IClient, IContact, IJob, ISite, ITag } from '../../../model/models';

export const ClientsNgrxActions = createActionGroup({
  source: 'Clients',
  events: {
    'Update Client': props<{
      isEdit: boolean;
      client: IClient;
      contacts: IContact[];
    }>(),
    'Update Client Success': props<{ client: IClient; contacts: IContact[] }>(),
    'Update Client Update Contacts': props<{
      client: IClient;
      contacts: IContact[];
    }>(),
    'Update Client Delete Contacts Success': props<{
      client: IClient;
      contacts: IContact[];
    }>(),
    'Update Client Add Contacts Success': props<{
      client: IClient;
      contacts: IContact[];
    }>(),

    'Delete Client': props<{ client: IClient }>(),
    'Delete Client Success': props<{ client: IClient }>(),
    'Delete Client Delete Contacts Success': props<{ client: IClient; contacts: IContact[] }>(),
    'Delete Client Delete Jobs Success': props<{ client: IClient; jobs: IJob[] }>(),
    'Delete Client Delete Sites Success': props<{ client: IClient; sites: ISite[] }>()
  }
});
