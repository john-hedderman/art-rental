import { Component, OnInit } from '@angular/core';

import { HeaderButton } from '../../model/models';
import { PageHeaderService } from '../../service/page-header-service';

@Component({
  selector: 'app-jobs',
  imports: [],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
  standalone: true,
})
export class Jobs implements OnInit {
  jobs = [];

  headerTitle = 'Jobs';

  headerButtons: HeaderButton[] = [];

  constructor(private pageHeaderService: PageHeaderService) {}

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
