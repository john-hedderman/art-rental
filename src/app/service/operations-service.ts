import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { OperationStatus } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  private _status: WritableSignal<OperationStatus> = signal({
    status: '',
    success: '',
    failure: '',
  });

  readonly operationStatus: Signal<OperationStatus> = this._status.asReadonly();

  setStatus(newStatus: OperationStatus): void {
    this._status.update(() => newStatus);
  }
}
