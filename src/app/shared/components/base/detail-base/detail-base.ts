import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { DataService } from '../../../../service/data-service';
import { Util } from '../../../util/util';

@Component({
  selector: 'app-detail-base',
  imports: [],
  templateUrl: './detail-base.html',
  styleUrl: './detail-base.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export abstract class DetailBase {
  dataService = inject(DataService);

  abstract preDelete(): void;
  abstract delete(): Promise<string>;
  abstract deleteStatus: string;
  abstract postDelete(): void;

  async deleteItem(callback?: any) {
    this.preDelete();
    await this.delete();
    this.postDelete();
    if (callback) {
      callback();
    }
  }

  async deleteAndReload(modifiedCollections: string[], callback?: any) {
    this.preDelete();
    this.deleteStatus = await this.delete();
    this.postDelete();
    if (callback) {
      callback();
    }
  }

  jobResult(statuses: string[]): string {
    return Util.jobResult(statuses);
  }

  constructor() {}
}
