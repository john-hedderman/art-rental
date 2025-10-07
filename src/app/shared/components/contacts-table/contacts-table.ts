import { Component, Input, input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { Contact } from '../../../model/models';

@Component({
  selector: 'app-contacts-table',
  imports: [NgxDatatableModule],
  templateUrl: './contacts-table.html',
  styleUrl: './contacts-table.scss',
  standalone: true,
})
export class ContactsTable implements OnInit {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @Input() rows: Contact[] = [];
  @Input() columns: TableColumn[] = [];

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['firstName']} ${rowA['lastName']}`;
    const nameB = `${rowB['firstName']} ${rowB['lastName']}`;
    return nameA.localeCompare(nameB);
  }
  ngOnInit(): void {
    this.columns = [
      {
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator,
      },
      {
        prop: 'title',
        name: 'Title',
      },
      {
        prop: 'phone',
        name: 'Phone',
      },
    ];
  }
}
