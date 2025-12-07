import { Component, inject } from '@angular/core';

import { DataService } from '../../../../service/data-service';
import { Util } from '../../../util/util';

@Component({
  selector: 'app-detail-base',
  imports: [],
  templateUrl: './detail-base.html',
  styleUrl: './detail-base.scss',
  standalone: true,
})
export abstract class DetailBase {
  dataService = inject(DataService);

  abstract preDelete(): void;
  abstract delete(): Promise<string>;
  abstract deleteStatus: string;
  abstract postDelete(): void;

  async deleteAndReload(modifiedCollections: string[], callback?: any) {
    this.preDelete();
    this.deleteStatus = await this.delete();
    this.postDelete();
    this.dataService.reloadData(modifiedCollections, callback);
  }

  jobResult(statuses: string[]): string {
    return Util.jobResult(statuses);
  }

  constructor() {}
}
