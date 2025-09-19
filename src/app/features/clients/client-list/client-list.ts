import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
  NgxDatatableModule,
  TableColumn,
  SelectionType,
  SelectEvent,
} from '@swimlane/ngx-datatable';

import { Client, HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-client-list',
  imports: [NgxDatatableModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class ClientList implements OnInit {
  @ViewChild('locationTemplate', { static: true }) locationTemplate!: TemplateRef<any>;

  headerTitle = 'Clients';
  navigateToAddClient = () => {
    this.router.navigate(['/clients', 'add']);
  };
  headerButtons: HeaderButton[] = [
    {
      id: 'addClientBtn',
      label: 'New Client',
      type: 'button',
      buttonClass: 'btn btn-primary btn-sm',
      disabled: false,
      clickHandler: this.navigateToAddClient,
    },
  ];

  rows: Client[] = [];
  columns: TableColumn[] = [];
  selected: Client[] = [];
  selectionType = SelectionType.single;

  constructor(
    private dataService: DataService,
    private router: Router,
    private pageHeaderService: PageHeaderService
  ) {
    this.dataService.clients$.subscribe((clients) => {
      if (clients) {
        this.rows = [...clients];
      }
    });
  }

  navigateToClientDetail(id: number) {
    this.router.navigate(['/clients', id]);
  }

  onSelect({ selected }: SelectEvent<Client>) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.navigateToClientDetail(selected[0].id);
  }

  locationComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['city']}, ${rowA['state']}`;
    const locationB = `${rowB['city']}, ${rowB['state']}`;
    return locationA.localeCompare(locationB);
  }

  ngOnInit(): void {
    this.pageHeaderService.send({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
    this.columns = [
      { prop: 'name', name: 'Name' },
      {
        prop: '',
        name: 'Location',
        cellTemplate: this.locationTemplate,
        comparator: this.locationComparator,
      },
      { prop: 'industry', name: 'Business' },
    ];
  }
}
