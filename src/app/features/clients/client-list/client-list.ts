import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxDatatableModule, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { Client } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { RowDetail } from '../../../directives/row-detail';

@Component({
  selector: 'app-client-list',
  imports: [NgxDatatableModule, PageHeader, PageFooter, RowDetail],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class ClientList implements OnInit, OnDestroy {
  @ViewChild('clientsTable') table!: DatatableComponent<Client>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('locationHeaderTemplate', { static: true }) locationHeaderTemplate!: TemplateRef<any>;
  @ViewChild('locationTemplate', { static: true }) locationTemplate!: TemplateRef<any>;
  @ViewChild('businessHeaderTemplate', { static: true }) businessHeaderTemplate!: TemplateRef<any>;
  @ViewChild('businessTemplate', { static: true }) businessTemplate!: TemplateRef<any>;

  goToAddClient = () => this.router.navigate(['/clients', 'add']);

  headerData = new HeaderActions('client-list', 'Clients', [], []);
  footerData = new FooterActions([new AddButton('Add Client', this.goToAddClient)]);

  rows: Client[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

  private readonly destroy$ = new Subject<void>();

  toggleExpandRow(row: Client) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/clients', event.row.client_id]);
    }
  }

  locationComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['city']}, ${rowA['state']}`;
    const locationB = `${rowB['city']}, ${rowB['state']}`;
    return locationA.localeCompare(locationB);
  }

  init() {
    this.columns = [
      {
        width: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        canAutoResize: false,
        cellTemplate: this.arrowTemplate,
      },
      { width: 300, prop: 'name', name: 'Name' },
      {
        width: 250,
        prop: '',
        name: 'Location',
        headerTemplate: this.locationHeaderTemplate,
        cellTemplate: this.locationTemplate,
        comparator: this.locationComparator,
      },
      {
        width: 200,
        prop: 'industry',
        name: 'Business',
        headerTemplate: this.businessHeaderTemplate,
        cellTemplate: this.businessTemplate,
      },
    ];

    this.dataService.clients$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(500))
      .subscribe((clients) => {
        if (clients) {
          this.rows = [...clients];
        }
      });
  }

  constructor(
    private dataService: DataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
