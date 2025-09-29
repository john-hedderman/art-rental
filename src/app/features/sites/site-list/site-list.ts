import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  NgxDatatableModule,
  SelectEvent,
  SelectionType,
  TableColumn,
} from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, HeaderData, Site } from '../../../model/models';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data-service';
import { combineLatest } from 'rxjs';

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
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressTemplate', { static: true }) siteAddressTemplate!: TemplateRef<any>;

  sites: Site[] = [];
  clients: Client[] = [];

  headerData: HeaderData = {
    headerTitle: 'Sites',
    headerButtons: [],
  };

  rows: Site[] = [];
  columns: TableColumn[] = [];
  selected: Site[] = [];
  selectionType = SelectionType.single;

  navigateToSiteDetail(id: string) {
    this.router.navigate(['/sites', id]);
  }

  onSelect({ selected }: SelectEvent<Site>) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.navigateToSiteDetail(selected[0].id);
  }

  addressComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['address1']}, ${rowA['city']}, ${rowA['state']} ${rowA['zipCode']}`;
    const locationB = `${rowB['address1']}, ${rowB['city']}, ${rowB['state']} ${rowB['zipCode']}`;
    return locationA.localeCompare(locationB);
  }

  constructor(private router: Router, private dataService: DataService) {
    combineLatest({ clients: this.dataService.clients$, sites: this.dataService.sites$ }).subscribe(
      ({ clients, sites }) => {
        if (clients && sites) {
          this.clients = clients;
          this.sites = sites.map((site: Site) => {
            const client = clients.find((client) => client.id === site.client?.id)!;
            // ensure client information is fleshed out
            return { ...site, client };
          });
          this.rows = [...this.sites];
        }
      }
    );
  }

  ngOnInit(): void {
    this.columns = [
      { prop: '', name: 'Client', cellTemplate: this.clientNameTemplate },
      {
        prop: '',
        name: 'Site Address',
        cellTemplate: this.siteAddressTemplate,
        comparator: this.addressComparator,
      },
    ];
  }
}
