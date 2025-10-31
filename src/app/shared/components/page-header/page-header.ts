import { Component, computed, input, Signal } from '@angular/core';
import { HeaderData } from '../../../model/models';
import { RouterLink } from '@angular/router';

import { OperationsService } from '../../../service/operations-service';
import { SUCCESS, FAILURE } from '../../../shared/constants';
import { OperationStatus } from '../../../../app/model/models';

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

  readonly OP_SUCCESS = SUCCESS;
  readonly OP_FAILURE = FAILURE;

  operationStatus: Signal<OperationStatus>;

  constructor(private operationsService: OperationsService) {
    this.operationStatus = computed(() => this.operationsService.operationStatus());
  }
}
