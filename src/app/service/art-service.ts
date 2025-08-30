import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Art } from '../shared/models';

@Injectable({
  providedIn: 'root',
})
export class ArtService {
  private artDataUrl = 'assets/art.json';

  constructor(private http: HttpClient) {}

  getArtData(): Observable<Art[]> {
    return this.http.get<Art[]>(this.artDataUrl);
  }
}
