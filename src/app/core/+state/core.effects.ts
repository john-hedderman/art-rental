import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, delay, exhaustMap, filter, map, of, take } from 'rxjs';

import { CoreDataActions } from './core.actions';
import { AppData } from './core-state';
import { DataService } from '../../service/data-service';
import { IArt, IArtist, IClient, IContact, IJob, ISite } from '../../model/models';
import * as Const from '../../constants';
import { selectLoaded } from './core.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class CoreEffects {
  private actions$ = inject(Actions);
  private dataService = inject(DataService);
  private store = inject(Store);

  loadAllData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoreDataActions.loadAllData),
      concatLatestFrom(() => this.store.select(selectLoaded)),
      filter(([action, loaded]) => action.refresh || !loaded),
      exhaustMap((action) =>
        this.dataService.getCombinedData$().pipe(
          take(1),
          map((data: AppData) => this.enhanceData(data)),
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
    const allData = { ...data };
    enhancedData.art = this.enhanceArtData(allData);
    enhancedData.artists = artists;
    enhancedData.clients = this.enhanceClientData(allData);
    enhancedData.contacts = this.enhanceContactData(allData);
    enhancedData.jobs = this.enhanceJobData(allData);
    enhancedData.sites = sites;
    enhancedData.tags = tags;
    return enhancedData;
  }

  enhanceArtData(allData: AppData): IArt[] {
    const { art, artists, clients, contacts, jobs, sites, tags } = allData;
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

  enhanceClientData(allData: AppData): IClient[] {
    const { art, artists, clients, contacts, jobs, sites, tags } = allData;
    return clients.map((clientItem: IClient) => {
      const contactItems = contacts.filter((contact) => contact.client_id === clientItem.client_id);
      clientItem = contactItems.length ? { ...clientItem, contacts: contactItems } : clientItem;
      const jobItems = jobs.filter((job) => job.client_id === clientItem.client_id);
      clientItem = jobItems.length ? { ...clientItem, jobs: jobItems } : clientItem;
      const siteItems = sites.filter((site) => site.client_id === clientItem.client_id);
      clientItem = siteItems.length ? { ...clientItem, sites: siteItems } : clientItem;
      return clientItem;
    });
  }

  enhanceContactData(allData: AppData): IContact[] {
    const { art, artists, clients, contacts, jobs, sites, tags } = allData;
    return contacts.map((contactItem: IContact) => {
      const clientItems = clients.filter((client) =>
        client.contact_ids.includes(contactItem.contact_id)
      );
      contactItem =
        clientItems.length === 1 ? { ...contactItem, client: clientItems[0] } : contactItem;
      return contactItem;
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
