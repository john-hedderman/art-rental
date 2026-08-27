import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, of, switchMap } from 'rxjs';

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
        switchMap(({ art, tagId }) => {
          const artItem = { ...art };
          delete (artItem as any)._id;
          artItem.tag_ids = [...art.tag_ids.filter((tag_id) => tag_id !== tagId), tagId];
          return from(
            this.dataService.saveDocument(artItem, Collections.Art, artItem.art_id, 'art_id')
          ).pipe(
            map((result) => {
              return TagActions.assignTagToArtSuccess({ art: artItem, tagId });
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
        map(({ art, tagId }) => {
          return CoreDataActions.clearOpStatus();
        })
      );
    },
    { functional: true }
  );
}
