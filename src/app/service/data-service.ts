import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable, ReplaySubject, Subject, takeUntil } from 'rxjs';

import { environment } from '../../environments/environment';
import { IArt, IArtist, IClient, IContact, Job, Site, ITag } from '../model/models';

type Source = {
  art: Observable<IArt[]>;
  artists: Observable<IArtist[]>;
  clients: Observable<IClient[]>;
  jobs: Observable<Job[]>;
  contacts: Observable<IContact[]>;
  sites: Observable<Site[]>;
  tags: Observable<ITag[]>;
};

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  public art$: ReplaySubject<IArt[]> = new ReplaySubject(1);
  public artists$: ReplaySubject<IArtist[]> = new ReplaySubject(1);
  public clients$: ReplaySubject<IClient[]> = new ReplaySubject(1);
  public contacts$: ReplaySubject<IContact[]> = new ReplaySubject(1);
  public jobs$: ReplaySubject<Job[]> = new ReplaySubject(1);
  public sites$: ReplaySubject<Site[]> = new ReplaySubject(1);
  public tags$: ReplaySubject<ITag[]> = new ReplaySubject(1);

  loadData<T>(dataType: string): Observable<T[]> {
    return this.http.get<T[]>(`${environment.apiUrl}/data/${dataType}`);
  }

  reloadData(collections: string[], callback?: any) {
    const source = {} as Source;
    for (const coll of collections) {
      if (coll === 'art') {
        source[coll] = this.loadData<IArt>(coll);
      } else if (coll === 'artists') {
        source[coll] = this.loadData<IArtist>(coll);
      } else if (coll === 'clients') {
        source[coll] = this.loadData<IClient>(coll);
      } else if (coll === 'contacts') {
        source[coll] = this.loadData<IContact>(coll);
      } else if (coll === 'jobs') {
        source[coll] = this.loadData<Job>(coll);
      } else if (coll === 'sites') {
        source[coll] = this.loadData<Site>(coll);
      } else if (coll === 'tags') {
        source[coll] = this.loadData<ITag>(coll);
      }
    }
    combineLatest(source)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ ...args }) => {
        if (collections.includes('art')) {
          this.art$.next(args['art']);
        }
        if (collections.includes('artists')) {
          this.artists$.next(args['artists']);
        }
        if (collections.includes('clients')) {
          this.clients$.next(args['clients']);
        }
        if (collections.includes('contacts')) {
          this.contacts$.next(args['contacts']);
        }
        if (collections.includes('jobs')) {
          this.jobs$.next(args['jobs']);
        }
        if (collections.includes('sites')) {
          this.sites$.next(args['sites']);
        }
        if (collections.includes('tags')) {
          this.tags$.next(args['tags']);
        }
        if (callback) {
          callback();
        }
      });
  }

  async saveDocument(
    data: any,
    collectionName: string,
    id?: number,
    recordId?: string
  ): Promise<any> {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      let response;
      if (id) {
        const paramsObj = {} as any;
        paramsObj['recordId'] = recordId;
        const params = new URLSearchParams(paramsObj);
        response = await fetch(
          `${environment.apiUrl}/data/${collectionName}/${id}?${params}`,
          options
        );
      } else {
        response = await fetch(`${environment.apiUrl}/data/${collectionName}`, options);
      }
      if (!response.ok) {
        throw new Error(
          `Save response not ok. Status: ${response.status} - ${response.statusText}`
        );
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error: any) {
      console.error('Saving edits failed. Fetch error:', error.message);
      throw error;
    }
  }

  async deleteDocument(collectionName: string, id: number, recordId: string): Promise<any> {
    try {
      const paramsObj = {} as any;
      paramsObj['recordId'] = recordId;
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`${environment.apiUrl}/data/${collectionName}/${id}?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(
          `Delete response not ok. Status: ${response.status} - ${response.statusText}`
        );
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error: any) {
      console.error('Delete failed. Fetch error:', error.message);
      throw error;
    }
  }

  async deleteDocuments(collectionName: string, recordId: string, id: number): Promise<any> {
    try {
      const paramsObj = {} as any;
      paramsObj['id'] = id;
      paramsObj['recordId'] = recordId;
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`${environment.apiUrl}/data/${collectionName}?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(
          `Delete response not ok. Status: ${response.status} - ${response.statusText}`
        );
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error: any) {
      console.error('Delete failed. Fetch error:', error.message);
      throw error;
    }
  }

  constructor(private http: HttpClient) {
    this.reloadData(['art', 'artists', 'clients', 'contacts', 'jobs', 'sites', 'tags']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
