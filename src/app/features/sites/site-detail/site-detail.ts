import { Component } from '@angular/core';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { HeaderData } from '../../../model/models';
import { Router } from '@angular/router';
import { ActionLink, HeaderActions } from '../../../shared/actions/action-data';

@Component({
  selector: 'app-site-detail',
  imports: [PageHeader],
  templateUrl: './site-detail.html',
  styleUrl: './site-detail.scss',
  standalone: true,
})
export class SiteDetail {
  goToEditSite = () => this.router.navigate(['/sites', this.siteId, 'edit']);
  goToSiteList = () => this.router.navigate(['/sites', 'list']);

  siteListLink = new ActionLink('siteListLink', 'Sites', '/sites/list', '', this.goToSiteList);
  headerData = new HeaderActions('site-detail', 'Site detail', [], [this.siteListLink.data]);

  siteId = 0;

  constructor(private router: Router) {}
}
