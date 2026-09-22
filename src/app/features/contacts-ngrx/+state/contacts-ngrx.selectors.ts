import { createSelector } from '@ngrx/store';
import { IContact } from '../../../model/models';
import { selectContacts } from '../../../core/+state/core.selectors';

export const selectContactsByClientId = (clientId: number) =>
  createSelector(selectContacts, (contacts) =>
    contacts.filter((contact: IContact) => contact.client_id === clientId)
  );
