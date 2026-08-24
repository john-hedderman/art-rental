import { Component, computed, input, Signal, ChangeDetectionStrategy } from '@angular/core';
import { HeaderData } from '../../../model/models';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { OperationsService } from '../../../service/operations-service';
import { OperationStatus } from '../../../../app/model/models';
import * as Constants from '../../../constants';
import { selectOpStatus } from '../../../core/+state/core.selectors';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'flex-shrink-0'
  }
})
export class PageHeader {
  headerData = input<HeaderData>({
    page: '',
    headerTitle: '',
    headerButtons: [],
    headerLinks: []
  });

  readonly OP_SUCCESS = Constants.SUCCESS;
  readonly OP_FAILURE = Constants.FAILURE;

  operationStatus: Signal<OperationStatus>;

  opStatus$: Observable<string | null>;

  constructor(
    private operationsService: OperationsService,
    private store: Store
  ) {
    this.operationStatus = computed(() => this.operationsService.operationStatus());
    this.opStatus$ = this.store.select(selectOpStatus);
  }
}
