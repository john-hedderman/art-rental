import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, of, switchMap } from 'rxjs';

import { TagActions } from './tags.actions';
import { CoreDataActions } from '../../../../core/+state/core.actions';
import { DataService } from '../../../../service/data-service';
import { Collections } from '../../../../shared/enums/collections';

@Injectable()
export class TagEffects {
  private actions$ = inject(Actions);
  private dataService = inject(DataService);

  assignTagToArt$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagActions.assignTagToArt),
        switchMap(({ art, tag }) => {
          const artItem = { ...art };
          delete (artItem as any)._id;
          artItem.tag_ids = [...art.tag_ids.filter((tag_id) => tag_id !== tag.tag_id), tag.tag_id];
          return from(
            this.dataService.saveDocument(artItem, Collections.Art, artItem.art_id, 'art_id')
          ).pipe(
            map((result) => {
              return TagActions.assignTagToArtSuccess({ art: artItem, tag });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagActions.assignTagToArtSuccess),
        switchMap(({ art, tag }) => {
          return of(TagActions.assignTagToArtUpdateTag({ art, tag }));
        })
      );
    },
    { functional: true }
  );

  assignTagToArtUpdateTag$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TagActions.assignTagToArtUpdateTag),
        switchMap(({ art, tag }) => {
          const tagItem = { ...tag };
          delete (tagItem as any)._id;
          tagItem.art_ids = [...tag.art_ids.filter((art_id) => art_id !== art.art_id), art.art_id];
          return from(
            this.dataService.saveDocument(tagItem, Collections.Tags, tagItem.tag_id, 'tag_id')
          ).pipe(
            map((result) => {
              return TagActions.assignTagToArtUpdateTagSuccess({ art, tag: tagItem });
            }),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  assignTagToArtUpdateTagSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TagActions.assignTagToArtUpdateTagSuccess),
      delay(2000),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });
}
