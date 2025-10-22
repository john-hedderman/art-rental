import { Component } from '@angular/core';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { HeaderData } from '../../../model/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site-detail',
  imports: [PageHeader],
  templateUrl: './site-detail.html',
  styleUrl: './site-detail.scss',
  standalone: true,
})
export class SiteDetail {
  navigateToSiteList = () => {
    this.router.navigate(['/sites', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Site detail',
    headerButtons: [
      {
        id: 'returnToSiteListBtn',
        label: 'Site list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToSiteList,
      },
    ],
    headerLinks: [],
  };

  constructor(private router: Router) {}
}
