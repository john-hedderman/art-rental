import { createSelector } from '@ngrx/store';
import { IContact } from '../../../model/models';
import { selectClients, selectContacts } from '../../../core/+state/core.selectors';

export const selectContactById = (id: number) =>
  createSelector(
    selectContacts,
    (contacts) => contacts.find((contact: IContact) => contact.contact_id === id)!
  );

export const selectContactsByClientId = (clientId: number) =>
  createSelector(selectContacts, (contacts) =>
    contacts.filter((contact: IContact) => contact.client_id === clientId)
  );

export const selectClientByContactId = (contactId: number) =>
  createSelector(selectClients, (clients) =>
    clients.find((client) => client.contact_ids.includes(contactId))
  );
