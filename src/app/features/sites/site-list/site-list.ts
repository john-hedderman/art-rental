import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { HeaderData, Site } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Util } from '../../../shared/util/util';

@Component({
  selector: 'app-site-list',
  imports: [PageHeader, NgxDatatableModule],
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
  @ViewChild('siteAddressHeaderTemplate', { static: true })
  siteAddressHeaderTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressTemplate', { static: true }) siteAddressTemplate!: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    Util.showHideRowDetail();
  }

  headerData: HeaderData = {
    headerTitle: 'Sites',
    headerButtons: [],
  };

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
      this.router.navigate(['/sites', event.row.id]);
    }
  }

  addressComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['address1']}, ${rowA['city']}, ${rowA['state']} ${rowA['zipCode']}`;
    const locationB = `${rowB['address1']}, ${rowB['city']}, ${rowB['state']} ${rowB['zipCode']}`;
    return locationA.localeCompare(locationB);
  }

  constructor(private router: Router, private dataService: DataService) {
    combineLatest({ clients: this.dataService.clients$, sites: this.dataService.sites$ })
      .pipe(take(1))
      .subscribe(({ clients, sites }) => {
        if (clients && sites) {
          const mergedSites = sites.map((site: Site) => {
            const client = clients.find((client) => client.id === site.client?.id)!;
            return { ...site, client };
          });
          this.rows = [...mergedSites];
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
        prop: '',
        name: 'Client',
        cellTemplate: this.clientNameTemplate,
      },
      {
        prop: '',
        name: 'Site Address',
        headerTemplate: this.siteAddressHeaderTemplate,
        cellTemplate: this.siteAddressTemplate,
        comparator: this.addressComparator,
      },
    ];
  }
}
