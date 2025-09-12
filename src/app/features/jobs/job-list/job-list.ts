import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import {
  NgxDatatableModule,
  SelectEvent,
  SelectionType,
  TableColumn,
} from '@swimlane/ngx-datatable';

import { HeaderButton, Job } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Router } from '@angular/router';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-job-list',
  imports: [NgxDatatableModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
  standalone: true,
})
export class JobList implements OnInit {
  headerTitle = 'Jobs';

  navigateToAddJob = () => {
    this.router.navigate(['/jobs', 'add']);
  };

  headerButtons: HeaderButton[] = [
    {
      id: 'addJobBtn',
      label: 'Add Job',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: false,
      clickHandler: this.navigateToAddJob,
    },
  ];

  rows: Job[] = [];
  columns: TableColumn[] = [];
  selected: Job[] = [];
  selectionType = SelectionType.single;

  constructor(
    private dataService: DataService,
    private router: Router,
    private pageHeaderService: PageHeaderService
  ) {
    this.dataService
      .load('jobs')
      .pipe(take(1))
      .subscribe((jobs) => {
        this.rows = jobs;
      });
  }

  navigateToJobDetail(id: number) {
    this.router.navigate(['/jobs', id]);
  }

  onSelect({ selected }: SelectEvent<Job>) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.navigateToJobDetail(selected[0].id);
  }

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
    this.columns = [
      { prop: 'id', name: 'Job ID' },
      { prop: 'clientId', name: 'Client ID' },
    ];
  }
}
