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
