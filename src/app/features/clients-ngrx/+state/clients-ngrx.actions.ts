import { createActionGroup, props } from '@ngrx/store';
import { IArtist, IClient, IContact, IJob, ISite, ITag } from '../../../model/models';

export const ClientsNgrxActions = createActionGroup({
  source: 'Clients',
  events: {
    'Add Or Edit Client': props<{
      isEdit: boolean;
      client: IClient;
      contacts: IContact[];
    }>(),
    'Add Client Success': props<{ isEdit: boolean; client: IClient; contacts: IContact[] }>(),
    'Edit Client Success': props<{ isEdit: boolean; client: IClient; contacts: IContact[] }>(),
    'Add Or Edit Client Update Contacts': props<{
      isEdit: boolean;
      client: IClient;
      contacts: IContact[];
    }>(),
    'Add Or Edit Client Update Contacts Success': props<{
      isEdit: boolean;
      client: IClient;
      contacts: IContact[];
    }>(),

    'Delete Client': props<{ client: IClient; tags: ITag[] }>(),
    'Delete Client Success': props<{ client: IClient; tags: ITag[] }>(),
    'Delete Client Update Contacts': props<{ client: IClient; contacts: IContact[] }>(),
    'Delete Client Update Contacts Success': props<{ client: IClient; contacts: IContact[] }>(),
    'Delete Client Update Jobs': props<{ client: IClient; jobs: IJob[] }>(),
    'Delete Client Update Jobs Success': props<{ client: IClient; jobs: IJob[] }>(),
    'Delete Client Update Sites': props<{ client: IClient; sites: ISite[] }>(),
    'Delete Client Update Sites Success': props<{ client: IClient; sites: ISite[] }>()
  }
});
