import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { HeaderButton } from '../../model/models';
import { Subscription } from 'rxjs';
import { PageHeaderService } from '../../service/page-header-service';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader implements OnInit, OnDestroy {
  headerData: any;
  private pageHeaderDataSubscription!: Subscription;

  constructor(private pageHeaderService: PageHeaderService) {}

  ngOnInit(): void {
    this.pageHeaderDataSubscription = this.pageHeaderService.data$.subscribe((data) => {
      this.headerData = data;
    });
  }

  ngOnDestroy(): void {
    this.pageHeaderDataSubscription.unsubscribe();
  }
}
