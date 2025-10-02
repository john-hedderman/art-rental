import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';
import { combineLatest } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Contact, HeaderData } from '../../../model/models';
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
  @ViewChild('contactsTable') table!: DatatableComponent<Contact>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('clientNameHeaderTemplate', { static: true })
  clientNameHeaderTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('phoneHeaderTemplate', { static: true }) phoneHeaderTemplate!: TemplateRef<any>;
  @ViewChild('phoneTemplate', { static: true }) phoneTemplate!: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  contacts: Contact[] = [];

  headerData: HeaderData = {
    headerTitle: 'Contacts',
    headerButtons: [],
  };

  rows: Contact[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

  checkScreenSize() {
    let detailRows;
    if (window.innerWidth >= 768) {
      detailRows = document.querySelectorAll('.datatable-row-detail:not(.d-none)');
      detailRows.forEach((detailRow) => {
        detailRow.classList.add('d-none');
      });
    } else {
      detailRows = document.querySelectorAll('.datatable-row-detail.d-none');
      detailRows.forEach((detailRow) => {
        detailRow.classList.remove('d-none');
      });
    }
  }

  toggleExpandRow(row: Contact) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

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
        width: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        canAutoResize: false,
        cellTemplate: this.arrowTemplate,
      },
      {
        width: 250,
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator,
      },
      {
        width: 200,
        name: 'Client',
        headerTemplate: this.clientNameHeaderTemplate,
        cellTemplate: this.clientNameTemplate,
        comparator: this.clientNameComparator,
      },
      {
        width: 150,
        prop: 'phone',
        name: 'Phone',
        headerTemplate: this.phoneHeaderTemplate,
        cellTemplate: this.phoneTemplate,
      },
    ];
  }
}
