import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private artistsDataUrl = 'assets/artists.json';

  constructor(private http: HttpClient) {}

  getArtistsData(): Observable<any[]> {
    return this.http.get<any[]>(this.artistsDataUrl);
  }
}
