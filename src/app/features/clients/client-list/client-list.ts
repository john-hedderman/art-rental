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
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-client-list',
  imports: [NgxDatatableModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
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
    this.dataService
      .load('clients')
      .pipe(take(1))
      .subscribe((clients) => {
        this.rows = clients;
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

  ngOnInit(): void {
    this.pageHeaderService.send({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
    this.columns = [
      { prop: 'name', name: 'Name' },
      { prop: 'location', name: 'Location', cellTemplate: this.locationTemplate },
      { prop: 'industry', name: 'Business' },
    ];
  }
}
