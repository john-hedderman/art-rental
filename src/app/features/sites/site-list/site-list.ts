import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Util } from '../../../shared/util/util';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';

@Component({
  selector: 'app-site-list',
  imports: [PageHeader, NgxDatatableModule, PageFooter],
  templateUrl: './site-list.html',
  styleUrl: './site-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class SiteList implements OnInit {
  @ViewChild('sitesTable') table!: DatatableComponent<Site>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('clientNameHeaderTemplate', { static: true })
  clientNameHeaderTemplate!: TemplateRef<any>;
  @ViewChild('siteNameTemplate', { static: true }) siteNameTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressHeaderTemplate', { static: true })
  siteAddressHeaderTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressTemplate', { static: true }) siteAddressTemplate!: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    Util.showHideRowDetail();
  }

  goToAddSite = () => this.router.navigate(['/sites', 'add']);
  headerData = new HeaderActions('site-list', 'Sites', [], []);
  footerData = new FooterActions([new AddButton('Add Site', this.goToAddSite)]);

  rows: Site[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

  toggleExpandRow(row: Site) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/sites', event.row.site_id]);
    }
  }

  addressComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['address1']}, ${rowA['city']}, ${rowA['state']} ${rowA['zip_code']}`;
    const locationB = `${rowB['address1']}, ${rowB['city']}, ${rowB['state']} ${rowB['zip_code']}`;
    return locationA.localeCompare(locationB);
  }

  constructor(private router: Router, private dataService: DataService) {
    combineLatest({ clients: this.dataService.clients$, sites: this.dataService.sites$ })
      .pipe(take(1))
      .subscribe(({ clients, sites }) => {
        if (clients && sites) {
          const fullSites = sites.map((site) => {
            const client = clients.find((client) => client.client_id === site.client_id)!;
            return { ...site, client };
          });
          this.rows = [...fullSites];
        }
      });
  }

  ngOnInit(): void {
    this.columns = [
      {
        width: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        canAutoResize: false,
        cellTemplate: this.arrowTemplate,
      },
      {
        width: 200,
        prop: '',
        name: 'Site',
        cellTemplate: this.siteNameTemplate,
      },
      {
        width: 250,
        prop: '',
        name: 'Site Address',
        headerTemplate: this.siteAddressHeaderTemplate,
        cellTemplate: this.siteAddressTemplate,
        comparator: this.addressComparator,
      },
      {
        width: 200,
        prop: '',
        name: 'Client',
        headerTemplate: this.clientNameHeaderTemplate,
        cellTemplate: this.clientNameTemplate,
      },
    ];
  }
}
