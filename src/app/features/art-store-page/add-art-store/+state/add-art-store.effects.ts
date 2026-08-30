import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, from, map, of, switchMap } from 'rxjs';

import { IJob } from '../../../../model/models';
import { ArtActions, CoreDataActions } from '../../../../core/+state/core.actions';
import { OperationsService } from '../../../../service/operations-service';
import { Collections } from '../../../../shared/enums/collections';
import * as Const from '../../../../constants';

@Injectable()
export class AddArtEffects {
  private actions$ = inject(Actions);
  private operationsService = inject(OperationsService);

  addOrEditArt$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.addOrEditArt),
        switchMap(({ isEdit, artItem, oldJobItem, newJobItem }) =>
          from(
            this.operationsService.saveDocument2(
              artItem,
              Collections.Art,
              isEdit ? artItem.art_id : undefined,
              isEdit ? 'art_id' : undefined
            )
          ).pipe(
            map((result) => {
              const art = { ...artItem };
              if (!isEdit && result.insertedId) {
                (art as any)._id = result.insertedId;
                return ArtActions.addArtSuccess({ artItem: art, oldJobItem, newJobItem });
              } else if (!isEdit && !result.insertedId) {
                throw new Error('Database error. Art was not saved.');
              } else if (isEdit && result.modifiedCount) {
                return ArtActions.editArtSuccess({ artItem, oldJobItem, newJobItem });
              } else {
                throw new Error('Database error. The art was not saved.');
              }
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

  addArtSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.addArtSuccess),
        switchMap(({ artItem, oldJobItem, newJobItem }) => {
          const job: IJob = { ...newJobItem };
          job.art_ids = [...job.art_ids, artItem.art_id];
          return of(ArtActions.addOrEditArtUpdateNewJob({ artItem, oldJobItem, newJobItem: job }));
        })
      );
    },
    { functional: true }
  );

  addOrEditArtUpdateNewJob$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.addOrEditArtUpdateNewJob),
        switchMap(({ oldJobItem, newJobItem }) => {
          const job = { ...newJobItem } as IJob;
          delete (job as any)._id;
          delete job.site;
          return from(
            this.operationsService.saveDocument2(job, Collections.Jobs, job.job_id, 'job_id')
          ).pipe(
            map((result) => {
              if (result.modifiedCount) {
                return ArtActions.addOrEditArtUpdateNewJobSuccess({ oldJobItem, newJobItem: job });
              }
              throw new Error('Database error. The new job was not saved.');
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

  addOrEditArtUpdateNewJobSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ArtActions.addOrEditArtUpdateNewJobSuccess),
      delay(Const.STD_DELAY),
      switchMap(() => {
        return [CoreDataActions.loadAllData({ refresh: true }), CoreDataActions.clearOpStatus()];
      })
    );
  });

  editArtSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.editArtSuccess),
        switchMap(({ artItem, oldJobItem, newJobItem }) => {
          const oldJobId = oldJobItem.job_id;
          const newJobId = newJobItem.job_id;
          if (oldJobId === newJobId) {
            return [
              CoreDataActions.loadAllData({ refresh: true }),
              CoreDataActions.delayClearOpStatus()
            ];
          }
          const job: IJob = { ...oldJobItem };
          // job.art_ids = [...job.art_ids, artItem.art_id];
          job.art_ids = job.art_ids.filter((art_id) => art_id !== artItem.art_id);
          return of(ArtActions.editArtUpdateOldJob({ artItem, oldJobItem: job, newJobItem }));
        })
      );
    },
    { functional: true }
  );

  editArtUpdateOldJob$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ArtActions.editArtUpdateOldJob),
        switchMap(({ artItem, oldJobItem, newJobItem }) => {
          const job = { ...oldJobItem } as IJob;
          delete (job as any)._id;
          delete job.site;
          return from(
            this.operationsService.saveDocument2(job, Collections.Jobs, job.job_id, 'job_id')
          ).pipe(
            map((result) => {
              if (!result.modifiedCount) {
                throw new Error('Database error. The old job was not saved.');
              }
              return ArtActions.editArtUpdateOldJobSuccess({
                artItem,
                oldJobItem: job,
                newJobItem
              });
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

  editArtUpdateOldJobSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ArtActions.editArtUpdateOldJobSuccess),
      switchMap(({ artItem, oldJobItem, newJobItem }) => {
        const newJob = { ...newJobItem };
        newJob.art_ids = [
          ...newJob.art_ids.filter((art_id) => art_id !== artItem.art_id),
          artItem.art_id
        ];
        return of(ArtActions.addOrEditArtUpdateNewJob({ artItem, oldJobItem, newJobItem: newJob }));
      })
    );
  });
}
