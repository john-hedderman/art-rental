import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { OPERATION_SUCCESS, OPERATION_FAILURE } from '../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  private _status: WritableSignal<string> = signal('');

  readonly operationStatus: Signal<string> = this._status.asReadonly();

  setStatus(newStatus: string): void {
    this._status.update(() => newStatus);
  }
}
