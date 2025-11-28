import { Component, computed, input, Signal } from '@angular/core';
import { HeaderData } from '../../../model/models';
import { RouterLink } from '@angular/router';

import { OperationsService } from '../../../service/operations-service';
import { OperationStatus } from '../../../../app/model/models';
import * as Constants from '../../../constants';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  headerData = input<HeaderData>({
    page: '',
    headerTitle: '',
    headerButtons: [],
    headerLinks: [],
  });

  readonly OP_SUCCESS = Constants.SUCCESS;
  readonly OP_FAILURE = Constants.FAILURE;

  operationStatus: Signal<string>;

  constructor(private operationsService: OperationsService) {
    this.operationStatus = computed(() => this.operationsService.operationStatus());
  }
}
