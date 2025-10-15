import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import {
  Art,
  ArtTest,
  Artist,
  ArtistTest,
  Client,
  ClientTest,
  Contact,
  ContactTest,
  Job,
  JobTest,
  Site,
  SiteTest,
} from '../model/models';

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

  public art_test$: ReplaySubject<ArtTest[]> = new ReplaySubject(1);
  public artists_test$: ReplaySubject<ArtistTest[]> = new ReplaySubject(1);
  public clients_test$: ReplaySubject<ClientTest[]> = new ReplaySubject(1);
  public jobs_test$: ReplaySubject<JobTest[]> = new ReplaySubject(1);
  public contacts_test$: ReplaySubject<ContactTest[]> = new ReplaySubject(1);
  public sites_test$: ReplaySubject<SiteTest[]> = new ReplaySubject(1);

  constructor(private http: HttpClient) {
    this.load('art').subscribe((art) => this.art$.next(art));
    this.load('artists').subscribe((artists) => this.artists$.next(artists));
    this.load('clients').subscribe((clients) => this.clients$.next(clients));
    this.load('jobs').subscribe((jobs) => this.jobs$.next(jobs));
    this.load('contacts').subscribe((contacts) => this.contacts$.next(contacts));
    this.load('sites').subscribe((sites) => this.sites$.next(sites));

    this.load('art_test').subscribe((art_test) => this.art_test$.next(art_test));
    this.load('artists_test').subscribe((artists_test) => this.artists_test$.next(artists_test));
    this.load('clients_test').subscribe((clients_test) => this.clients_test$.next(clients_test));
    this.load('jobs_test').subscribe((jobs_test) => this.jobs_test$.next(jobs_test));
    this.load('contacts_test').subscribe((contacts_test) =>
      this.contacts_test$.next(contacts_test)
    );
    this.load('sites_test').subscribe((sites_test) => this.sites_test$.next(sites_test));
  }

  load(data: 'art'): Observable<Art[]>;
  load(data: 'artists'): Observable<Artist[]>;
  load(data: 'clients'): Observable<Client[]>;
  load(data: 'jobs'): Observable<Job[]>;
  load(data: 'contacts'): Observable<Contact[]>;
  load(data: 'sites'): Observable<Site[]>;

  load(data: 'art_test'): Observable<ArtTest[]>;
  load(data: 'artists_test'): Observable<ArtistTest[]>;
  load(data: 'clients_test'): Observable<ClientTest[]>;
  load(data: 'jobs_test'): Observable<JobTest[]>;
  load(data: 'contacts_test'): Observable<ContactTest[]>;
  load(data: 'sites_test'): Observable<SiteTest[]>;

  load(data: string): Observable<unknown[]> {
    // load data from a separate server
    // see project art-rental-server (in short, run "node app")
    return this.http.get<unknown[]>(`http://localhost:3000/data/${data}`);
  }
}
