import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Art, Artist, Client, Job } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public art$: BehaviorSubject<any> = new BehaviorSubject(null);
  public artists$: BehaviorSubject<any> = new BehaviorSubject(null);
  public clients$: BehaviorSubject<any> = new BehaviorSubject(null);
  public jobs$: BehaviorSubject<any> = new BehaviorSubject(null);

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
