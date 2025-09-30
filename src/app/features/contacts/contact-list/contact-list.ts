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
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;

  contacts: Contact[] = [];

  headerData: HeaderData = {
    headerTitle: 'Contacts',
    headerButtons: [],
  };

  rows: Contact[] = [];
  columns: TableColumn[] = [];

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['firstName']} ${rowA['lastName']}`;
    const nameB = `${rowB['firstName']} ${rowB['lastName']}`;
    return nameA.localeCompare(nameB);
  }

  clientNameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const clientNameA = `${rowA['client']['name']}`;
    const clientNameB = `${rowB['client']['name']}`;
    return clientNameA.localeCompare(clientNameB);
  }

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
      {
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator,
      },
      {
        name: 'Client',
        cellTemplate: this.clientNameTemplate,
        comparator: this.clientNameComparator,
      },
      { prop: 'phone', name: 'Phone' },
    ];
  }
}
