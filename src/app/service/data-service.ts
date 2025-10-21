import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { Art, Artist, Client, Contact, ContactTest, Job, Site } from '../model/models';

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

  public contacts_test$: ReplaySubject<ContactTest[]> = new ReplaySubject(1);

  constructor(private http: HttpClient) {
    this.load('art').subscribe((art) => this.art$.next(art));
    this.load('artists').subscribe((artists) => this.artists$.next(artists));
    this.load('clients').subscribe((clients) => this.clients$.next(clients));
    this.load('jobs').subscribe((jobs) => this.jobs$.next(jobs));
    this.load('contacts').subscribe((contacts) => this.contacts$.next(contacts));
    this.load('sites').subscribe((sites) => this.sites$.next(sites));

    this.load('contacts_test').subscribe((contacts_test) =>
      this.contacts_test$.next(contacts_test)
    );
  }

  load(dataType: 'art'): Observable<Art[]>;
  load(dataType: 'artists'): Observable<Artist[]>;
  load(dataType: 'clients'): Observable<Client[]>;
  load(dataType: 'jobs'): Observable<Job[]>;
  load(dataType: 'contacts'): Observable<Contact[]>;
  load(dataType: 'sites'): Observable<Site[]>;

  load(dataType: 'contacts_test'): Observable<ContactTest[]>;

  load(dataType: string): Observable<unknown[]> {
    // load data from a separate server
    // see project art-rental-server
    return this.http.get<unknown[]>(`http://localhost:3000/data/${dataType}`);
  }

  saveDocument(data: any, collectionName: string): void {
    fetch(`http://localhost:3000/data/${collectionName}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .catch((err) => {
        console.error(`${collectionName} error:`, err);
      })
      .then((response: any) => {
        return response.json();
      });
  }

  replaceDocument(data: any, collectionName: string, id: number, recordId: string): void {
    const paramsObj = {} as any;
    paramsObj['recordId'] = recordId;
    const params = new URLSearchParams(paramsObj);
    fetch(`http://localhost:3000/data/${collectionName}/${id}?${params}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .catch((err) => {
        console.error(`${collectionName} error:`, err);
      })
      .then((response: any) => {
        return response.json();
      });
  }
}
