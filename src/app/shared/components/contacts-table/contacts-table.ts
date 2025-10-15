import { Component, Input, input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { ContactTest } from '../../../model/models';

@Component({
  selector: 'app-contacts-table',
  imports: [NgxDatatableModule],
  templateUrl: './contacts-table.html',
  styleUrl: './contacts-table.scss',
  standalone: true,
})
export class ContactsTable implements OnInit {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @Input() rows: ContactTest[] = [];
  @Input() columns: TableColumn[] = [];

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
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
