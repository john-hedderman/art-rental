import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable, ReplaySubject, take } from 'rxjs';
import { Art, Artist, Client, Contact, Job, Site } from '../model/models';

type Source = {
  art: Observable<Art[]>;
  artists: Observable<Artist[]>;
  clients: Observable<Client[]>;
  jobs: Observable<Job[]>;
  contacts: Observable<Contact[]>;
  sites: Observable<Site[]>;
};

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public art$: ReplaySubject<Art[]> = new ReplaySubject(1);
  public artists$: ReplaySubject<Artist[]> = new ReplaySubject(1);
  public clients$: ReplaySubject<Client[]> = new ReplaySubject(1);
  public jobs$: ReplaySubject<Job[]> = new ReplaySubject(1);
  public contacts$: ReplaySubject<Contact[]> = new ReplaySubject(1);
  public sites$: ReplaySubject<Site[]> = new ReplaySubject(1);

  loadData<T>(dataType: string): Observable<T[]> {
    return this.http.get<T[]>(`http://localhost:3000/data/${dataType}`);
  }

  reloadData(collections: string[], callback?: any) {
    const source = {} as Source;
    for (const coll of collections) {
      if (coll === 'art') {
        source[coll] = this.loadData<Art>(coll);
      } else if (coll === 'artists') {
        source[coll] = this.loadData<Artist>(coll);
      } else if (coll === 'clients') {
        source[coll] = this.loadData<Client>(coll);
      } else if (coll === 'contacts') {
        source[coll] = this.loadData<Contact>(coll);
      } else if (coll === 'jobs') {
        source[coll] = this.loadData<Job>(coll);
      } else if (coll === 'sites') {
        source[coll] = this.loadData<Site>(coll);
      }
    }
    combineLatest(source)
      .pipe(take(1))
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
          'Content-Type': 'application/json',
        },
      };
      let response;
      if (id) {
        const paramsObj = {} as any;
        paramsObj['recordId'] = recordId;
        const params = new URLSearchParams(paramsObj);
        response = await fetch(
          `http://localhost:3000/data/${collectionName}/${id}?${params}`,
          options
        );
      } else {
        response = await fetch(`http://localhost:3000/data/${collectionName}`, options);
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
      const response = await fetch(`http://localhost:3000/data/${collectionName}/${id}?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`http://localhost:3000/data/${collectionName}?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
    this.reloadData(['art', 'artists', 'clients', 'contacts', 'jobs', 'sites']);
  }
}
