import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, of, switchMap } from 'rxjs';

import { ArtistActions } from '../../+state/artists-ngrx.actions';
import { OperationsService } from '../../../../service/operations-service';
import { Collections } from '../../../../shared/enums/collections';
import { CoreDataActions } from '../../../../core/+state/core.actions';
import { IArtist } from '../../../../model/models';
import * as Const from '../../../../constants';

@Injectable()
export class AddArtistEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);

  addOrEditArtist$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ArtistActions.addOrEditArtist),
      switchMap(({ isEdit, artist }) => {
        const artistItem = { ...artist };
        const tags = artistItem.tags;
        delete artistItem.tags;
        return from(
          this.operationsService.saveDocument2(
            artistItem,
            Collections.Artists,
            isEdit ? artist.artist_id : undefined,
            isEdit ? 'artist_id' : undefined
          )
        ).pipe(
          map((result) => {
            if (!isEdit && result.insertedId) {
              (artistItem as any)._id = result.insertedId;
              const artist = { ...artistItem, tags };
              return ArtistActions.addArtistSuccess({ artist });
            } else if (!isEdit && !result.insertedId) {
              throw new Error('Database error. The artist was not saved.');
            } else if (isEdit && result.modifiedCount) {
              return ArtistActions.editArtistSuccess({ artist });
            } else {
              throw new Error('Database error. The artist was not saved.');
            }
          }),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  addArtistSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ArtistActions.addArtistSuccess),
      delay(Const.STD_DELAY),
      switchMap(() => {
        return [CoreDataActions.loadAllData({ refresh: true }), CoreDataActions.clearOpStatus()];
      })
    );
  });
}
