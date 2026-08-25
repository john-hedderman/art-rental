import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, mergeMap, of, switchMap } from 'rxjs';

import { OperationsService } from '../../../../service/operations-service';
import { DataService } from '../../../../service/data-service';
import { Collections } from '../../../../shared/enums/collections';
import { ArtActions, CoreDataActions } from '../../../../core/+state/core.actions';

@Injectable()
export class ArtDetailEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);
  private dataService = inject(DataService);

  deleteArtItem$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.deleteArtItem),
        switchMap(({ job, artId }) =>
          from(this.operationsService.deleteDocument(Collections.Art, 'art_id', artId)).pipe(
            map((result) => {
              return ArtActions.deleteArtItemSuccess({ job, artId, result });
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

  deleteArtItemSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.deleteArtItemSuccess),
        switchMap((action) => {
          const job = { ...action.job };
          job.art_ids = [...job.art_ids.filter((art_id) => art_id !== action.artId)];
          delete job.client;
          delete job.site;
          const collection = Collections.Jobs;
          const idField = 'job_id';
          return of(
            ArtActions.deleteArtItemUpdateJob({ job, collection, idField, jobId: job.job_id })
          );
        })
      );
    },
    { functional: true }
  );

  deleteArtItemUpdateJob$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.deleteArtItemUpdateJob),
        mergeMap(({ job, collection, idField, jobId }) => {
          return from(this.dataService.saveDocument(job, collection, jobId, idField)).pipe(
            map((result) => ArtActions.deleteArtItemUpdateJobSuccess({ job, result })),
            catchError((error) =>
              of(ArtActions.deleteArtItemUpdateJobFailure({ errorMessage: error.message }))
            )
          );
        })
      );
    },
    { functional: true }
  );
}
