import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteChangeService {
  private _routeChanges: Subject<string>;

  get routeChanges$() {
    return this._routeChanges.asObservable();
  }

  constructor(private router: Router) {
    this._routeChanges = new Subject<string>();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._routeChanges.next(event.url);
      }
    });
  }
}
