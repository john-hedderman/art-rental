import { Component, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Contact } from '../../../model/models';
import { Util } from '../../util/util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contacts-table',
  imports: [NgxDatatableModule],
  templateUrl: './contacts-table.html',
  styleUrl: './contacts-table.scss',
  standalone: true,
})
export class ContactsTable implements OnInit {
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
    Util.showHideRowDetail();
  }

  @Input() rows: Contact[] = [];

  columns: TableColumn[] = [];

  toggleExpandRow(row: Contact) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/contacts', event.row.contact_id]);
    }
  }

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  clientNameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const clientNameA = `${rowA['client']['name']}`;
    const clientNameB = `${rowB['client']['name']}`;
    return clientNameA.localeCompare(clientNameB);
  }

  constructor(private router: Router) {}

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
