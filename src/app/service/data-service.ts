import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Art, Artist, Client, Job } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public art$: BehaviorSubject<Art[]> = new BehaviorSubject([] as Art[]);
  public artists$: BehaviorSubject<Artist[]> = new BehaviorSubject([] as Artist[]);
  public clients$: BehaviorSubject<Client[]> = new BehaviorSubject([] as Client[]);
  public jobs$: BehaviorSubject<Job[]> = new BehaviorSubject([] as Job[]);

  constructor(private http: HttpClient) {
    this.load('art').subscribe((art) => this.art$.next(art));
    this.load('artists').subscribe((artists) => this.artists$.next(artists));
    this.load('clients').subscribe((clients) => this.clients$.next(clients));
    this.load('jobs').subscribe((jobs) => this.jobs$.next(jobs));
  }

  load(data: 'art'): Observable<Art[]>;
  load(data: 'artists'): Observable<Artist[]>;
  load(data: 'clients'): Observable<Client[]>;
  load(data: 'jobs'): Observable<Job[]>;

  load(data: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`assets/data/${data}.json`);
  }
}
