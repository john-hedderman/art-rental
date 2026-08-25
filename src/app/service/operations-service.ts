import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { OperationStatus } from '../model/models';
import * as Const from '../constants';
import { DataService } from './data-service';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private _status: WritableSignal<OperationStatus> = signal({ status: '', message: '' });

  readonly operationStatus: Signal<OperationStatus> = this._status.asReadonly();

  dataService = inject(DataService);

  public showStatus(status: OperationStatus) {
    this._status.update(() => status);
  }

  async saveDocument(
    data: any,
    collectionName: string,
    id?: number,
    field?: string
  ): Promise<string> {
    let result = Const.SUCCESS;
    try {
      const response = await this.dataService.saveDocument(data, collectionName, id, field);
      if (response.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async saveDocument2(
    data: any,
    collectionName: string,
    id?: number,
    field?: string
  ): Promise<{
    opStatus: string;
    insertedId: number | undefined;
    modifiedCount: number | undefined;
  }> {
    const result = {
      opStatus: Const.SUCCESS,
      insertedId: undefined,
      modifiedCount: undefined
    };
    try {
      const response = await this.dataService.saveDocument(data, collectionName, id, field);
      if (id && response.modifiedCount === 0) {
        result.opStatus = Const.FAILURE;
      } else if (id) {
        result.modifiedCount = response.modifiedCount;
      }
      if (!id && !response.insertedId) {
        result.opStatus = Const.FAILURE;
      } else if (!id) {
        result.insertedId = response.insertedId;
      }
    } catch (error) {
      console.error('Save error:', error);
      result.opStatus = Const.FAILURE;
    }
    return result;
  }

  async deleteDocument(collectionName: string, recordId: string, id: number): Promise<string> {
    let result = Const.SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(collectionName, recordId, id);
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
      const returnData = await this.dataService.deleteDocuments(collectionName, field, id);
      if (returnData.deletedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = Const.FAILURE;
    }
    return result;
  }
}
