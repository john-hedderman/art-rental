import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

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
      label: 'Add Client',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: false,
      clickHandler: this.navigateToAddClient,
    },
  ];

  rows: Client[] = [];
  columns: TableColumn[] = [];

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

  ngOnInit(): void {
    this.pageHeaderService.sendData({
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
