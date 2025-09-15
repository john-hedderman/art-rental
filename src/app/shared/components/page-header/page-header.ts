import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-page-header',
  imports: [AsyncPipe],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  constructor(public pageHeaderService: PageHeaderService) {}
}
