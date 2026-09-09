import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, mergeMap, of, switchMap, take, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { TagsNgrxActions } from './tags-ngrx.actions';
import { OperationsService } from '../../../../service/operations-service';
import { Collections } from '../../../../shared/enums/collections';
import * as Const from '../../../../constants';
import { CoreDataActions } from '../../../../core/+state/core.actions';
import { selectArt, selectArtists } from '../../../../core/+state/core.selectors';
import { DataService } from '../../../../service/data-service';

@Injectable()
export class TagsNgrxEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private store = inject(Store);
  private dataService = inject(DataService);

  addTag$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.addTag),
      switchMap(({ tag }) => {
        return from(this.operationsService.saveDocument2(tag, Collections.Tags)).pipe(
          map((result) => {
            if (result.insertedId) {
              return TagsNgrxActions.addTagSuccess({ tag });
            } else {
              throw new Error('Database error. The tag was not saved.');
            }
          })
        );
      })
    );
  });

  addTagSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.addTagSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });

  deleteTag$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.deleteTag),
      switchMap(({ tag }) => {
        return from(
          this.operationsService.deleteDocument(Collections.Tags, 'tag_id', tag.tag_id)
        ).pipe(
          map((result) => TagsNgrxActions.deleteTagSuccess({ tag })),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteTagSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.deleteTagSuccess),
      withLatestFrom(this.store.select(selectArt)),
      switchMap(([{ tag }, artItems]) => {
        const art = artItems.filter((artItem) => artItem.tag_ids.includes(tag.tag_id));
        return of(TagsNgrxActions.deleteTagUpdateArt({ tag, art }));
      })
    );
  });

  deleteTagUpdateArt$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.deleteTagUpdateArt),
      switchMap(({ tag, art }) => {
        if (!art || !art.length) {
          return of([]).pipe(
            map((result) => TagsNgrxActions.deleteTagUpdateArtSuccess({ tag, art })),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        }
        return from(art).pipe(
          mergeMap((artItem) => {
            const pieceOfArt = { ...artItem };
            delete (pieceOfArt as any)._id;
            const tag_ids = pieceOfArt.tag_ids.filter((tag_id) => tag_id !== tag.tag_id);
            pieceOfArt.tag_ids = [...tag_ids];
            return from(
              this.dataService.saveDocument(
                pieceOfArt,
                Collections.Art,
                pieceOfArt.art_id,
                'art_id'
              )
            );
          }),
          take(1),
          map((result) => TagsNgrxActions.deleteTagUpdateArtSuccess({ tag, art })),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteTagUpdateArtSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.deleteTagUpdateArtSuccess),
      withLatestFrom(this.store.select(selectArtists)),
      switchMap(([{ tag, art }, artistItems]) => {
        const artists = artistItems.filter((artistItem) => artistItem.tag_ids.includes(tag.tag_id));
        return of(TagsNgrxActions.deleteTagUpdateArtists({ tag, artists }));
      })
    );
  });

  deleteTagUpdateArtists$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.deleteTagUpdateArtists),
      switchMap(({ tag, artists }) => {
        if (!artists || !artists.length) {
          return of([]).pipe(
            map((result) => TagsNgrxActions.deleteTagUpdateArtistsSuccess({ tag, artists })),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        }
        return from(artists).pipe(
          mergeMap((artistItem) => {
            const artist = { ...artistItem };
            delete (artist as any)._id;
            const tag_ids = artist.tag_ids.filter((tag_id) => tag_id !== tag.tag_id);
            artist.tag_ids = [...tag_ids];
            return from(
              this.dataService.saveDocument(
                artist,
                Collections.Artists,
                artist.artist_id,
                'artist_id'
              )
            );
          }),
          take(1),
          map((result) => TagsNgrxActions.deleteTagUpdateArtistsSuccess({ tag, artists })),
          catchError((error) => of(CoreDataActions.generalFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteTagUpdateArtistsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagsNgrxActions.deleteTagUpdateArtistsSuccess),
      delay(Const.STD_DELAY),
      map(() => CoreDataActions.clearOpStatus())
    );
  });
}
