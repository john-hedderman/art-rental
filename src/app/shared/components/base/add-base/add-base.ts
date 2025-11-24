import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { OperationsService } from '../../../../service/operations-service';
import * as Const from '../../../../constants';
import { DataService } from '../../../../service/data-service';

@Component({
  selector: 'app-add-base',
  imports: [],
  templateUrl: './add-base.html',
  styleUrl: './add-base.scss',
  standalone: true,
})
export abstract class AddBase {
  operationsService = inject(OperationsService);
  dataService = inject(DataService);
  http = inject(HttpClient);

  abstract dbData: any;

  abstract populateData(): void;

  showOpStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  clearOpStatus(status: string, desiredDelay?: number) {
    const delay = status === Const.SUCCESS ? desiredDelay : Const.CLEAR_ERROR_DELAY;
    this.showOpStatus('', '', '', delay);
  }

  reloadFromDb(collections: string[]) {
    for (const coll of collections) {
      if (coll === 'art') {
        this.dataService.load(coll).subscribe((data) => this.dataService.art$.next(data));
      } else if (coll === 'artists') {
        this.dataService.load(coll).subscribe((data) => this.dataService.artists$.next(data));
      } else if (coll === 'clients') {
        this.dataService.load(coll).subscribe((data) => this.dataService.clients$.next(data));
      } else if (coll === 'contacts') {
        this.dataService.load(coll).subscribe((data) => this.dataService.contacts$.next(data));
      } else if (coll === 'jobs') {
        this.dataService.load(coll).subscribe((data) => this.dataService.jobs$.next(data));
      } else if (coll === 'sites') {
        this.dataService.load(coll).subscribe((data) => this.dataService.sites$.next(data));
      }
    }
  }

  populateForm<T>(collection: string, recordId: string, id: number) {
    this.http
      .get<T[]>(`http://localhost:3000/data/${collection}/${id}?recordId=${recordId}`)
      .subscribe((data) => {
        if (data && data.length === 1) {
          this.dbData = data[0];
          if (this.dbData) {
            this.populateData();
          }
        }
      });
  }

  constructor() {}
}
