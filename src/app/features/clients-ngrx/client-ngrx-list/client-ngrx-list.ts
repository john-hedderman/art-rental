import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { IClient } from '../../../model/models';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { distinctUntilChanged, Observable, Subject, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectClients } from '../../../core/+state/core.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Component({
  imports: [PageHeader, NgxDatatableModule, PageFooter],
  selector: 'app-client-ngrx-list',
  styleUrl: './client-ngrx-list.scss',
  templateUrl: './client-ngrx-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100'
  }
})
export class ClientNgrxList implements OnInit, OnDestroy {
  @ViewChild('clientsTable') table!: DatatableComponent<IClient>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('locationHeaderTemplate', { static: true }) locationHeaderTemplate!: TemplateRef<any>;
  @ViewChild('locationTemplate', { static: true }) locationTemplate!: TemplateRef<any>;
  @ViewChild('businessHeaderTemplate', { static: true }) businessHeaderTemplate!: TemplateRef<any>;
  @ViewChild('businessTemplate', { static: true }) businessTemplate!: TemplateRef<any>;

  private router = inject(Router);
  private store = inject(Store);

  goToAddClient = () => this.router.navigate(['/clients-ngrx', 'add']);

  headerData = new HeaderActions('client-list', 'Clients', [], []);
  footerData = new FooterActions([new AddButton('Add Client', this.goToAddClient)]);

  rows: IClient[] = [];
  columns: TableColumn[] = [];

  expanded: any = {};

  clients$: Observable<IClient[]>;

  destroy$ = new Subject<void>();

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/clients-ngrx', event.row.client_id]);
    }
  }

  toggleExpandRow(row: IClient) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  locationComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['city']}, ${rowA['state']}`;
    const locationB = `${rowB['city']}, ${rowB['state']}`;
    return locationA.localeCompare(locationB);
  }

  constructor() {
    this.clients$ = this.store.select(selectClients);
  }

  ngOnInit(): void {
    this.columns = [
      {
        width: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        canAutoResize: false,
        cellTemplate: this.arrowTemplate
      },
      { width: 300, prop: 'name', name: 'Name' },
      {
        width: 250,
        prop: '',
        name: 'Location',
        headerTemplate: this.locationHeaderTemplate,
        cellTemplate: this.locationTemplate,
        comparator: this.locationComparator
      },
      {
        width: 200,
        prop: 'industry',
        name: 'Business',
        headerTemplate: this.businessHeaderTemplate,
        cellTemplate: this.businessTemplate
      }
    ];

    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));

    this.clients$.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe((clients) => {
      this.rows = [...clients];
    });

    // this.dataService.clients$
    //   .pipe(takeUntil(this.destroy$), distinctUntilChanged())
    //   .subscribe((clients) => {
    //     if (clients) {
    //       this.rows = [...clients];
    //     }
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
