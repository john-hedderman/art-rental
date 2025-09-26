import { Component, OnInit } from '@angular/core';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Contact, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-contact-list',
  imports: [NgxDatatableModule, PageHeader],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class ContactList implements OnInit {
  contacts: Contact[] = [];

  headerData: HeaderData = {
    headerTitle: 'Contacts',
    headerButtons: [],
  };

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  constructor(private dataService: DataService) {
    this.dataService.contacts$.subscribe((contacts) => {
      if (contacts) {
        this.contacts = contacts;
        this.rows = [...this.contacts];
      }
    });
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'firstName', name: 'First Name' },
      { prop: 'lastName', name: 'Last Name' },
      { prop: 'clientId', name: 'Client ID' },
      { prop: 'phone', name: 'Phone' },
    ];
  }
}
