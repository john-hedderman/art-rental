import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ClientsNgrxActions } from './clients-ngrx.actions';
import { delay, from, map, switchMap } from 'rxjs';

import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Injectable()
export class ClientsNgrxEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);

  addOrEditClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.addOrEditClient),
      switchMap(({ isEdit, client }) => {
        return from(this.operationsService.saveDocument2(client, Collections.Clients)).pipe(
          map((result) => {
            if (result.insertedId) {
              return ClientsNgrxActions.addClientSuccess({ client });
            } else {
              throw new Error('Database error. The client was not saved.');
            }
          })
        );
      })
    );
  });

  addClientSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ClientsNgrxActions.addClientSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });
}
