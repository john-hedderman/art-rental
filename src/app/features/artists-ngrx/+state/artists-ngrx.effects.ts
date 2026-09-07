import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, mergeMap, of, switchMap } from 'rxjs';

import { ArtistActions } from './artists-ngrx.actions';
import { OperationsService } from '../../../service/operations-service';
import { Collections } from '../../../shared/enums/collections';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';

@Injectable()
export class ArtistDetailEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private dataService = inject(DataService);

  deleteArtist$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtistActions.deleteArtist),
        switchMap(({ artist, tags }) =>
          from(
            this.operationsService.deleteDocument(
              Collections.Artists,
              'artist_id',
              artist.artist_id
            )
          ).pipe(
            map((result) => {
              return ArtistActions.deleteArtistSuccess({ artist, tags });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          )
        )
      );
    },
    { functional: true }
  );

  deleteArtistSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtistActions.deleteArtistSuccess),
        switchMap(({ artist, tags }) => {
          return of(ArtistActions.deleteArtistUpdateTags({ artist, tags }));
        })
      );
    },
    { functional: true }
  );

  deleteArtistUpdateTags$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtistActions.deleteArtistUpdateTags),
        mergeMap(({ artist, tags }) => {
          return from(tags)
            .pipe(
              mergeMap((tag) => {
                const tagItem = { ...tag };
                delete (tagItem as any)._id;
                return from(
                  this.dataService.saveDocument(tagItem, Collections.Tags, tagItem.tag_id, 'tag_id')
                );
              })
            )
            .pipe(
              map((result) => ArtistActions.deleteArtistUpdateTagsSuccess({ artist, tags })),
              catchError((error) =>
                of(CoreDataActions.generalFailure({ errorMessage: error.message }))
              )
            );
          // return from(
          //   this.dataService.saveDocument(tags, Collections.Tags, tag.tag_id, 'tag_id')
          // ).pipe(
          //   map((result) => ArtistActions.deleteArtistUpdateTagsSuccess({ job, result })),
          //   catchError((error) =>
          //     of(CoreDataActions.generalFailure({ errorMessage: error.message }))
          //   )
          // );
        })
      );
    },
    { functional: true }
  );

  deleteArtistUpdateTagsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ArtistActions.deleteArtistUpdateTagsSuccess),
      delay(Const.STD_DELAY),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });
}
