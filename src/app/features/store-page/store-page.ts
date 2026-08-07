import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCount } from './+state/store-page.selectors';
import { increment, decrement, reset } from './+state/store-page.actions';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div>Current Count: {{ count$ | async }}</div>
    <button (click)="onIncrement()">Increment</button>
    <button (click)="onDecrement()">Decrement</button>
    <button (click)="onReset()">Reset</button>
  `
})
export class StorePage {
  count$: Observable<number>;

  constructor(private store: Store) {
    this.count$ = this.store.select(selectCount);
  }

  onIncrement() {
    this.store.dispatch(increment());
  }
  onDecrement() {
    this.store.dispatch(decrement());
  }
  onReset() {
    this.store.dispatch(reset());
  }
}
