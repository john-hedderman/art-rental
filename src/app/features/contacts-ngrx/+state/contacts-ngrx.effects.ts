import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ContactsNgrxActions } from './contacts-ngrx.actions';
import { catchError, delay, from, map, mergeMap, of, switchMap, take, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { IClient } from '../../../model/models';
import { selectClients } from '../../../core/+state/core.selectors';
import { DataService } from '../../../service/data-service';

@Injectable()
export class ContactsNgrxEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private store = inject(Store);
  private dataService = inject(DataService);

  /**********************/
  /*                    */
  /*  Add/Edit Contact  */
  /*                    */
  /**********************/

  updateContact$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ContactsNgrxActions.updateContact),
      switchMap(({ isEdit, contact, oldClient, newClient }) => {
        const contactWithoutEnhancements = { ...contact };
        delete contactWithoutEnhancements.client;
        return from(
          this.operationsService.saveDocument2(
            contactWithoutEnhancements,
            Collections.Contacts,
            isEdit ? contact.contact_id : undefined,
            isEdit ? 'contact_id' : undefined
          )
        ).pipe(
          map((result) => {
            if (!isEdit && result.insertedId) {
              return ContactsNgrxActions.updateContactSuccess({ contact, oldClient, newClient });
            } else if (!isEdit && !result.insertedId) {
              throw new Error('Database error. The contact was not saved.');
            } else if (isEdit && result.modifiedCount) {
              return ContactsNgrxActions.updateContactSuccess({ contact, oldClient, newClient });
            } else {
              throw new Error('Database error. The contact was not saved.');
            }
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  updateContactUpdateNewClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ContactsNgrxActions.updateContactSuccess),
      switchMap(({ contact, newClient }) => {
        const clientItem = { ...newClient } as IClient;
        delete (clientItem as any)._id;
        delete clientItem.contacts;
        delete clientItem.jobs;
        delete clientItem.sites;
        clientItem.contact_ids = [
          ...clientItem.contact_ids.filter((contact_id) => contact_id !== contact.contact_id),
          contact.contact_id
        ];
        return from(
          this.operationsService.saveDocument2(
            clientItem,
            Collections.Clients,
            clientItem.client_id,
            'client_id'
          )
        ).pipe(
          map((result) => {
            if (result.modifiedCount) {
              return ContactsNgrxActions.updateContactUpdateClientSuccess({ client: clientItem });
            }
            throw new Error('Database error. The updated client was not saved.');
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  updateContactUpdateOldClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ContactsNgrxActions.updateContactSuccess),
      switchMap(({ contact, oldClient }) => {
        const clientItem = { ...oldClient } as IClient;
        delete (clientItem as any)._id;
        delete clientItem.contacts;
        delete clientItem.jobs;
        delete clientItem.sites;
        clientItem.contact_ids = [
          ...clientItem.contact_ids.filter((contact_id) => contact_id !== contact.contact_id)
        ];
        return from(
          this.operationsService.saveDocument2(
            clientItem,
            Collections.Clients,
            clientItem.client_id,
            'client_id'
          )
        ).pipe(
          map((result) => {
            if (result.modifiedCount) {
              return ContactsNgrxActions.updateContactUpdateClientSuccess({ client: clientItem });
            }
            throw new Error('Database error. The updated client was not saved.');
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  updateContactUpdateClientSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ContactsNgrxActions.updateContactUpdateClientSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });

  /********************/
  /*                  */
  /*  Delete Contact  */
  /*                  */
  /********************/

  deleteContact$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ContactsNgrxActions.deleteContact),
        switchMap(({ contact, client }) =>
          from(
            this.operationsService.deleteDocument(
              Collections.Contacts,
              'contact_id',
              contact.contact_id
            )
          ).pipe(
            map((result) => ContactsNgrxActions.deleteContactSuccess({ contact, client })),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          )
        )
      );
    },
    { functional: true }
  );

  deleteContactSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ContactsNgrxActions.deleteContactSuccess),
        switchMap(({ contact, client }) => {
          const clientItem = { ...client };
          delete (clientItem as any)._id;
          delete clientItem.contacts;
          delete clientItem.jobs;
          delete clientItem.sites;
          return of(ContactsNgrxActions.deleteContactUpdateClient({ contact, client: clientItem }));
        })
      );
    },
    { functional: true }
  );

  deleteContactUpdateClient$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ContactsNgrxActions.deleteContactUpdateClient),
        mergeMap(({ contact, client }) => {
          return from(
            this.dataService.saveDocument(
              client,
              Collections.Clients,
              client.client_id,
              'client_id'
            )
          ).pipe(
            map((result) => ContactsNgrxActions.deleteContactUpdateClientSuccess({ client })),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  deleteContactUpdateClientSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ContactsNgrxActions.deleteContactUpdateClientSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });
}
