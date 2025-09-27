import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Contact, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { combineLatest } from 'rxjs';

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
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;

  contacts: Contact[] = [];

  headerData: HeaderData = {
    headerTitle: 'Contacts',
    headerButtons: [],
  };

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  constructor(private dataService: DataService) {
    combineLatest({
      contacts: this.dataService.contacts$,
      clients: this.dataService.clients$,
    }).subscribe(({ contacts, clients }) => {
      const mergedContacts = contacts.map((contact) => {
        const client = clients.find((client) => client.id === contact.client.id) ?? ({} as Client);
        return { ...contact, client };
      });
      this.rows = [...mergedContacts];
    });
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'firstName', name: 'First Name' },
      { prop: 'lastName', name: 'Last Name' },
      { prop: '', name: 'Client', cellTemplate: this.clientNameTemplate },
      { prop: 'phone', name: 'Phone' },
    ];
  }
}
