import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, combineLatest } from 'rxjs';
import { DataService } from '../../../service/data-service';
import { DataActions } from '../+state/art-store-page.actions';
import { IArt, IArtist, IClient, IJob, ISite } from '../../../model/models';

@Injectable()
export class ArtEffects {
  private actions$ = inject(Actions);
  private dataService = inject(DataService);

  loadData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataActions.loadData),
        switchMap(() =>
          combineLatest({
            art: this.dataService.art$,
            artists: this.dataService.artists$,
            clients: this.dataService.clients$,
            jobs: this.dataService.jobs$,
            sites: this.dataService.sites$
          }).pipe(
            map((allData) => this.enhanceArtData(allData)),
            map((items) => DataActions.loadDataSuccess({ items })),
            catchError((error) => of(DataActions.loadDataFailure({ errorMessage: error.message })))
          )
        )
      );
    },
    { functional: true }
  );

  enhanceArtData(allData: {
    art: IArt[];
    artists: IArtist[];
    clients: IClient[];
    jobs: IJob[];
    sites: ISite[];
  }): IArt[] {
    const { art, artists, clients, jobs, sites } = allData;
    return art
      .map((artItem: IArt) => {
        let jobItem = jobs.find((job: IJob) => job.job_id === artItem.job_id);
        if (jobItem) {
          const clientItem = clients.find(
            (client: IClient) => client.client_id === jobItem?.client_id
          );
          if (clientItem) {
            jobItem = { ...jobItem, client: clientItem };
          }
          const siteItem = sites.find((site: ISite) => site.site_id === jobItem?.site_id);
          if (siteItem) {
            jobItem = { ...jobItem, site: siteItem };
          }
          return { ...artItem, job: jobItem };
        }
        return artItem;
      })
      .map((artItem: IArt) => {
        const artistItem = artists.find(
          (artist: IArtist) => artist.artist_id === artItem.artist_id
        );
        if (artistItem) {
          artItem = { ...artItem, artist: artistItem };
        }
        return artItem;
      });
  }
}
