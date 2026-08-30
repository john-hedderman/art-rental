import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, exhaustMap, map, of, take } from 'rxjs';

import { CoreDataActions } from './core.actions';
import { AppData } from './core-state';
import { DataService } from '../../service/data-service';
import { IArt, IArtist, IClient, IJob, ISite } from '../../model/models';
import * as Const from '../../constants';

@Injectable()
export class CoreEffects {
  private actions$ = inject(Actions);
  private dataService = inject(DataService);

  loadAllData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoreDataActions.loadAllData),
      exhaustMap(() =>
        this.dataService.getCombinedData$().pipe(
          take(1),
          map((data) => this.enhanceData(data)),
          map((data) => CoreDataActions.loadAllDataSuccess({ data })),
          catchError((error) =>
            of(CoreDataActions.loadDataFailure({ errorMessage: error.message }))
          )
        )
      )
    );
  });

  loadAllDataSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoreDataActions.loadAllDataSuccess),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });

  delayClearOpStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoreDataActions.delayClearOpStatus),
      delay(Const.STD_DELAY),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });

  enhanceData(data: AppData): AppData {
    const enhancedData: AppData = {} as AppData;
    const { art, artists, clients, contacts, jobs, sites, tags } = data;
    const dataTypes = { ...data };
    enhancedData.art = this.enhanceArtData(dataTypes);
    enhancedData.artists = artists;
    enhancedData.clients = clients;
    enhancedData.contacts = contacts;
    enhancedData.jobs = this.enhanceJobData(dataTypes);
    enhancedData.sites = sites;
    enhancedData.tags = tags;
    return enhancedData;
  }

  enhanceArtData(allData: AppData): IArt[] {
    const { art, artists, clients, jobs, sites } = allData;
    return art
      .map((artItem: IArt) => {
        let jobItem = jobs.find((job: IJob) => job.job_id === artItem.job_id);
        if (jobItem) {
          const clientItem = clients.find(
            (client: IClient) => client.client_id === jobItem?.client_id
          );
          jobItem = clientItem ? { ...jobItem, client: clientItem } : jobItem;
          const siteItem = sites.find((site: ISite) => site.site_id === jobItem?.site_id);
          jobItem = siteItem ? { ...jobItem, site: siteItem } : jobItem;
          return { ...artItem, job: jobItem };
        }
        return artItem;
      })
      .map((artItem: IArt) => {
        const artistItem = artists.find(
          (artist: IArtist) => artist.artist_id === artItem.artist_id
        );
        artItem = artistItem ? { ...artItem, artist: artistItem } : artItem;
        return artItem;
      });
  }

  enhanceJobData(allData: AppData): IJob[] {
    const { clients, jobs, sites } = allData;
    return jobs.map((jobItem: IJob) => {
      const clientItem = clients.find((client: IClient) => client.client_id === jobItem.client_id);
      jobItem = clientItem ? { ...jobItem, client: clientItem } : jobItem;
      const siteItem = sites.find((site: ISite) => site.site_id === jobItem.site_id);
      jobItem = siteItem ? { ...jobItem, site: siteItem } : jobItem;
      return jobItem;
    });
  }

  generalFailure$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoreDataActions.generalFailure),
      delay(2000),
      map(() => {
        return CoreDataActions.clearOpStatus();
      })
    );
  });
}
