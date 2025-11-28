import { inject, Injectable } from '@angular/core';
import { OperationsService } from './operations-service';
import { MessageQueue } from '../shared/messages/message-queue';
import * as Const from '../constants';
import { OperationStatus } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  operationsService = inject(OperationsService);
  messageQueue: MessageQueue;

  logStatus = (status: OperationStatus) => {
    this.operationsService.showStatus(status);
  };

  showStatus(status: string, success: string, failure: string) {
    const message = status === Const.SUCCESS ? success : failure;
    this.messageQueue.addMessage({ status, message });
  }

  clearStatus() {
    this.messageQueue.addMessage({ status: '', message: '' });
  }

  constructor() {
    this.messageQueue = new MessageQueue(this.logStatus, Const.STD_DELAY);
  }
}
