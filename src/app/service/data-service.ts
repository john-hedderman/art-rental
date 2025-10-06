import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { Art, Artist, Client, Contact, Job, Site } from '../model/models';

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

  constructor(private http: HttpClient) {
    this.load('art').subscribe((art) => this.art$.next(art));
    this.load('artists').subscribe((artists) => this.artists$.next(artists));
    this.load('clients').subscribe((clients) => this.clients$.next(clients));
    this.load('jobs').subscribe((jobs) => this.jobs$.next(jobs));
    this.load('contacts').subscribe((contacts) => this.contacts$.next(contacts));
    this.load('sites').subscribe((sites) => this.sites$.next(sites));
  }

  load(data: 'art'): Observable<Art[]>;
  load(data: 'artists'): Observable<Artist[]>;
  load(data: 'clients'): Observable<Client[]>;
  load(data: 'jobs'): Observable<Job[]>;
  load(data: 'contacts'): Observable<Contact[]>;
  load(data: 'sites'): Observable<Site[]>;

  load(data: string): Observable<unknown[]> {
    // load data from a separate server
    // see project art-rental-server (in short, run "node app")
    return this.http.get<unknown[]>(`http://localhost:3000/data/${data}`);
  }
}
