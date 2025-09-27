import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { Art, Artist, Client, Contact, Job } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public art$: ReplaySubject<Art[]> = new ReplaySubject(1);
  public artists$: ReplaySubject<Artist[]> = new ReplaySubject(1);
  public clients$: ReplaySubject<Client[]> = new ReplaySubject(1);
  public jobs$: ReplaySubject<Job[]> = new ReplaySubject(1);
  public contacts$: ReplaySubject<Contact[]> = new ReplaySubject(1);

  constructor(private http: HttpClient) {
    this.load('art').subscribe((art) => this.art$.next(art));
    this.load('artists').subscribe((artists) => this.artists$.next(artists));
    this.load('clients').subscribe((clients) => this.clients$.next(clients));
    this.load('jobs').subscribe((jobs) => this.jobs$.next(jobs));
    this.load('contacts').subscribe((contacts) => this.contacts$.next(contacts));
  }

  load(data: 'art'): Observable<Art[]>;
  load(data: 'artists'): Observable<Artist[]>;
  load(data: 'clients'): Observable<Client[]>;
  load(data: 'jobs'): Observable<Job[]>;
  load(data: 'contacts'): Observable<Contact[]>;

  load(data: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`assets/data/${data}.json`);
  }
}
