import { Component } from '@angular/core';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-table-test',
  imports: [NgxDatatableModule],
  templateUrl: './table-test.html',
  styleUrl: './table-test.scss',
  standalone: true,
})
export class TableTest {
  rows = [
    { name: 'Alice', gender: 'Female', company: 'Example Inc.' },
    { name: 'Bob', gender: 'Male', company: 'Another Corp.' },
  ];

  columns = [
    { prop: 'name', name: 'Name' },
    { prop: 'gender', name: 'Gender' },
    { prop: 'company', name: 'Company' },
  ];
}
