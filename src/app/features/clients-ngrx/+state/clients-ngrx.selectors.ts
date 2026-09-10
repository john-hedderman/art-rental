import { createSelector } from '@ngrx/store';
import { IClient } from '../../../model/models';
import { selectClients } from '../../../core/+state/core.selectors';

export const selectClientById = (id: number) =>
  createSelector(
    selectClients,
    (clients) => clients.find((client: IClient) => client.client_id === id)!
  );
