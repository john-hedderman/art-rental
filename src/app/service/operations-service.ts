import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { OperationStatus } from '../model/models';
import * as Const from '../constants';
import { DataService } from './data-service';

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

  dataService = inject(DataService);

  private _setStatus(newStatus: OperationStatus): void {
    this._status.update(() => newStatus);
  }

  public setStatus(newStatus: OperationStatus, delay?: number): void {
    if (delay) {
      setTimeout(() => {
        this._setStatus(newStatus);
      }, delay);
    } else {
      this._setStatus(newStatus);
    }
  }

  async saveDocument(data: any, collectionName: string, id?: number, field?: string) {
    let result = Const.SUCCESS;
    try {
      const returnData = await this.dataService.saveDocument(data, collectionName, id, field);
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async deleteDocument(collectionName: string, field: string, id: number): Promise<string> {
    let result = Const.SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(collectionName, id, field);
      if (returnData.deletedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async deleteDocuments(collectionName: string, field: string, id: number): Promise<string> {
    let result = Const.SUCCESS;
    try {
      await this.dataService.deleteDocuments(collectionName, field, id);
    } catch (error) {
      console.error('Delete error:', error);
      result = Const.FAILURE;
    }
    return result;
  }
}
