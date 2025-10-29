import { Component, computed, input, Signal } from '@angular/core';
import { HeaderData } from '../../../model/models';
import { RouterLink } from '@angular/router';

import { OperationsService } from '../../../service/operations-service';
import { OPERATION_SUCCESS, OPERATION_FAILURE } from '../../../shared/constants';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  headerData = input<HeaderData>({
    headerTitle: '',
    headerButtons: [],
    headerLinks: [],
  });

  readonly OP_SUCCESS = OPERATION_SUCCESS;
  readonly OP_FAILURE = OPERATION_FAILURE;

  operationStatus: Signal<string>;

  constructor(private operationsService: OperationsService) {
    this.operationStatus = computed(() => this.operationsService.operationStatus());
  }
}
