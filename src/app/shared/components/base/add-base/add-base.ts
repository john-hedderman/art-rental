import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { OperationsService } from '../../../../service/operations-service';
import * as Msgs from '../../../../shared/strings';
import { DataService } from '../../../../service/data-service';
import { ActivatedRoute } from '@angular/router';
import { Util } from '../../../util/util';
import { MessagesService } from '../../../../service/messages-service';

@Component({
  selector: 'app-add-base',
  imports: [],
  templateUrl: './add-base.html',
  styleUrl: './add-base.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export abstract class AddBase {
  operationsService = inject(OperationsService);
  dataService = inject(DataService);
  messagesService = inject(MessagesService);
  http = inject(HttpClient);
  route = inject(ActivatedRoute);

  abstract dbData: any;
  abstract submitted: boolean;
  abstract editMode: boolean;
  abstract saveStatus: string;

  abstract populateData(): void;
  abstract preSave(): void;
  abstract save(): Promise<string>;
  abstract resetForm(): void;

  postSave(entity: string): void {
    const isStoreFeatureActive = localStorage.getItem('showStoreFeature') === 'true';
    if (!isStoreFeatureActive) {
      this.messagesService.showStatus(
        this.saveStatus,
        Util.replaceTokens(Msgs.SAVED, { entity }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity })
      );
      this.messagesService.clearStatus();
    }
    this.enableSaveBtn();
  }

  populateForm<T>(collection: string, recordId: string, id: number) {
    this.populateData();
  }

  disableSaveBtn() {
    const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    saveBtn.disabled = true;
  }

  enableSaveBtn() {
    const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    saveBtn.disabled = false;
  }

  async submitForm(form: any, modifiedCollections: string[], entity: string) {
    this.submitted = true;
    if (form.valid) {
      this.preSave();
      await this.save();
      this.postSave(entity);
    }
  }

  jobResult(statuses: string[]): string {
    return Util.jobResult(statuses);
  }

  constructor() {}
}
