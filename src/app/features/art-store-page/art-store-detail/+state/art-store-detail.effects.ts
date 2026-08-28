import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, mergeMap, of, switchMap } from 'rxjs';

import { OperationsService } from '../../../../service/operations-service';
import { DataService } from '../../../../service/data-service';
import { Collections } from '../../../../shared/enums/collections';
import { ArtActions, CoreDataActions } from '../../../../core/+state/core.actions';
import * as Const from '../../../../constants';

@Injectable()
export class ArtDetailEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private dataService = inject(DataService);

  deleteArt$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.deleteArt),
        switchMap(({ art, job, artId }) =>
          from(this.operationsService.deleteDocument(Collections.Art, 'art_id', artId)).pipe(
            map((result) => {
              return ArtActions.deleteArtSuccess({ job, artId, result });
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

  deleteArtSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.deleteArtSuccess),
        switchMap((action) => {
          const job = { ...action.job };
          job.art_ids = job.art_ids.filter((art_id) => art_id !== action.artId);
          delete job.client;
          delete job.site;
          // const collection = Collections.Jobs;
          // const idField = 'job_id';
          return of(ArtActions.deleteArtUpdateJob({ job }));
        })
      );
    },
    { functional: true }
  );

  deleteArtUpdateJob$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.deleteArtUpdateJob),
        mergeMap(({ job }) => {
          return from(
            this.dataService.saveDocument(job, Collections.Jobs, job.job_id, 'job_id')
          ).pipe(
            map((result) => ArtActions.deleteArtUpdateJobSuccess({ job, result })),
            catchError((error) =>
              of(CoreDataActions.generalFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );

  deleteArtUpdateJobSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ArtActions.deleteArtUpdateJobSuccess),
      delay(Const.STD_DELAY),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });
}
