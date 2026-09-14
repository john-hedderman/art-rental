import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ClientsNgrxActions } from './clients-ngrx.actions';
import { catchError, delay, from, map, mergeMap, of, switchMap, take, withLatestFrom } from 'rxjs';

import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { Store } from '@ngrx/store';
import { selectContacts } from '../../../core/+state/core.selectors';

@Injectable()
export class ClientsNgrxEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private store = inject(Store);

  addOrEditClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.addOrEditClient),
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
              return ClientsNgrxActions.addClientSuccess({ isEdit, client, contacts });
            } else if (!isEdit && !result.insertedId) {
              throw new Error('Database error. The client was not saved.');
            } else if (isEdit && result.modifiedCount) {
              return ClientsNgrxActions.editClientSuccess({ isEdit, client, contacts });
            } else {
              throw new Error('Database error. The client was not saved.');
            }
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        )
      )
    );
  });

  addClientSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.addClientSuccess),
      switchMap(({ isEdit, client, contacts }) =>
        of(ClientsNgrxActions.addOrEditClientUpdateContacts({ isEdit, client, contacts }))
      )
    );
  });

  addOrEditClientUpdateContacts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.addOrEditClientUpdateContacts),
      switchMap(({ isEdit, client, contacts }) => {
        const resultObserver = from(contacts).pipe(
          mergeMap((contactItem) => {
            const contact = { ...contactItem };
            contact.client_id = client.client_id;
            return from(
              this.operationsService.saveDocument2(
                contact,
                Collections.Contacts,
                isEdit ? contact.contact_id : undefined,
                isEdit ? 'contact_id' : undefined
              )
            );
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
            const newContacts = uniqueStoreContacts.concat(editedContacts);
            return ClientsNgrxActions.addOrEditClientUpdateContactsSuccess({
              isEdit,
              client,
              contacts: newContacts
            });
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
        return resultObserver;
      })
    );
  });

  addOrEditClientUpdateContactsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.addOrEditClientUpdateContactsSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });
}
