import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewFilterService {
  private _artistId = signal<string>('All');
  public artistId$: Observable<string> = toObservable(this._artistId);

  public selectArtistId(id: string) {
    this._artistId.set(id);
  }
}
