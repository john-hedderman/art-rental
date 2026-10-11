import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IArtist, IClient, IContact, IJob, ISite, ITag } from '../../../model/models';

export const ContactsNgrxActions = createActionGroup({
  source: 'Contacts',
  events: {
    'Update Contact': props<{
      isEdit: boolean;
      contact: IContact;
      oldClient: IClient;
      newClient: IClient;
    }>(),
    'Update Contact Success': props<{
      contact: IContact;
      oldClient: IClient;
      newClient: IClient;
    }>(),
    'Update Contact Update Clients': props<{ client: IClient }>(),
    'Update Contact Update Client': props<{ client: IClient }>(),
    'Update Contact Update Client Success': props<{ client: IClient }>(),

    'Delete Contact': props<{ contact: IContact; client: IClient }>(),
    'Delete Contact Success': props<{ contact: IContact; client: IClient }>(),
    'Delete Contact Update Client': props<{ contact: IContact; client: IClient }>(),
    'Delete Contact Update Client Success': props<{ client: IClient }>()
  }
});
