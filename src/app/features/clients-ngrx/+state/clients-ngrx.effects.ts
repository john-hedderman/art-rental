import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ClientsNgrxActions } from './clients-ngrx.actions';
import { catchError, delay, from, map, mergeMap, of, switchMap, take, withLatestFrom } from 'rxjs';

import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { Store } from '@ngrx/store';
import { selectContacts, selectJobs, selectSites } from '../../../core/+state/core.selectors';
import { DataService } from '../../../service/data-service';

@Injectable()
export class ClientsNgrxEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private dataService = inject(DataService);
  private store = inject(Store);

  /*********************/
  /*                   */
  /*  Add/Edit Client  */
  /*                   */
  /*********************/

  updateClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.updateClient),
      switchMap(({ isEdit, client, contacts }) =>
        from(
          this.operationsService.saveDocument2(
            client,
            Collections.Clients,
            isEdit ? client.client_id : undefined,
            isEdit ? 'client_id' : undefined
          )
        ).pipe(
          map((result) => {
            if (!isEdit && result.insertedId) {
              return ClientsNgrxActions.updateClientSuccess({ client, contacts });
            } else if (!isEdit && !result.insertedId) {
              throw new Error('Database error. The client was not saved.');
            } else if (isEdit && result.modifiedCount) {
              return ClientsNgrxActions.updateClientSuccess({ client, contacts });
            } else {
              throw new Error('Database error. The client was not saved.');
            }
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        )
      )
    );
  });

  updateClientSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.updateClientSuccess),
      switchMap(({ client, contacts }) =>
        from(
          this.dataService.deleteDocuments(Collections.Contacts, 'client_id', client.client_id)
        ).pipe(
          map((result) => {
            // TODO: start using an object for "result" instead of a string, and check deletedCount
            if (result.message.indexOf('failed') !== -1) {
              throw new Error(
                'Database error. Any contacts changes were not saved in the database.'
              );
            } else {
              return ClientsNgrxActions.updateClientDeleteContactsSuccess({
                client,
                contacts
              });
            }
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        )
      )
    );
  });

  updateClientAddContacts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.updateClientDeleteContactsSuccess),
      switchMap(({ client, contacts }) =>
        from(contacts).pipe(
          mergeMap((contactItem) => {
            const contact = { ...contactItem };
            contact.client_id = client.client_id;
            return from(this.operationsService.saveDocument2(contact, Collections.Contacts));
          }),
          take(1),
          withLatestFrom(this.store.select(selectContacts)),
          map(([result, storeContacts]) => {
            let editedContacts = [...contacts];
            editedContacts = editedContacts.map((updatedContact) => ({
              ...updatedContact,
              client_id: client.client_id
            }));

            const excludedIds = new Set(editedContacts.map((contact) => contact.contact_id));
            const uniqueStoreContacts = storeContacts.filter(
              (contact) => !excludedIds.has(contact.contact_id)
            );
            const newFullContacts = uniqueStoreContacts.concat(editedContacts);
            return ClientsNgrxActions.updateClientAddContactsSuccess({
              client,
              contacts: newFullContacts
            });
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        )
      )
    );
  });

  updateClientAddContactsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.updateClientAddContactsSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });

  /*******************/
  /*                 */
  /*  Delete Client  */
  /*                 */
  /*******************/

  deleteClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.deleteClient),
      switchMap(({ client }) =>
        from(
          this.operationsService.deleteDocument(Collections.Clients, 'client_id', client.client_id)
        ).pipe(
          map((result) => ClientsNgrxActions.deleteClientSuccess({ client })),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        )
      )
    );
  });

  deleteClientDeleteContacts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.deleteClientSuccess),
      withLatestFrom(this.store.select(selectContacts)),
      switchMap(([{ client }, contacts]) => {
        const clientContacts = contacts.filter((contact) => contact.client_id === client.client_id);
        if (!clientContacts || !clientContacts.length) {
          return of([]).pipe(
            map(() =>
              ClientsNgrxActions.deleteClientDeleteContactsSuccess({
                client,
                contacts: clientContacts
              })
            ),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        }
        return from(
          this.dataService.deleteDocuments(Collections.Contacts, 'client_id', client.client_id)
        ).pipe(
          map((result) =>
            ClientsNgrxActions.deleteClientDeleteContactsSuccess({
              client,
              contacts: clientContacts
            })
          ),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteClientDeleteJobs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.deleteClientSuccess),
      withLatestFrom(this.store.select(selectJobs)),
      switchMap(([{ client }, jobs]) => {
        const clientJobs = jobs.filter((job) => client.job_ids.includes(job.job_id));
        if (!clientJobs || !clientJobs.length) {
          return of([]).pipe(
            map(() =>
              ClientsNgrxActions.deleteClientDeleteJobsSuccess({
                client,
                jobs: clientJobs
              })
            ),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        }
        return from(
          this.dataService.deleteDocuments(Collections.Jobs, 'client_id', client.client_id)
        ).pipe(
          map((result) =>
            ClientsNgrxActions.deleteClientDeleteJobsSuccess({
              client,
              jobs: clientJobs
            })
          ),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteClientDeleteSites$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.deleteClientSuccess),
      withLatestFrom(this.store.select(selectSites)),
      switchMap(([{ client }, sites]) => {
        const clientSites = sites.filter((site) => client.site_ids.includes(site.site_id));
        if (!clientSites || !clientSites.length) {
          return of([]).pipe(
            map(() =>
              ClientsNgrxActions.deleteClientDeleteSitesSuccess({
                client,
                sites: clientSites
              })
            ),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        }
        return from(
          this.dataService.deleteDocuments(Collections.Sites, 'client_id', client.client_id)
        ).pipe(
          map((result) =>
            ClientsNgrxActions.deleteClientDeleteSitesSuccess({
              client,
              sites: clientSites
            })
          ),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteClientClearStatusSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.deleteClientSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });
}
