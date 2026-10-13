import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { ISite } from '../../../model/models';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { selectSites } from '../../../core/+state/core.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Component({
  imports: [PageHeader, NgxDatatableModule, PageFooter],
  selector: 'app-sites-ngrx-list',
  styleUrl: './sites-ngrx-list.scss',
  templateUrl: './sites-ngrx-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100'
  }
})
export class SitesNgrxList implements OnInit, OnDestroy {
  @ViewChild('sitesTable') table!: DatatableComponent<ISite>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('siteNameTemplate', { static: true }) siteNameTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressHeaderTemplate', { static: true })
  siteAddressHeaderTemplate!: TemplateRef<any>;
  @ViewChild('siteAddressTemplate', { static: true }) siteAddressTemplate!: TemplateRef<any>;
  @ViewChild('clientNameHeaderTemplate', { static: true })
  clientNameHeaderTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;

  private router = inject(Router);
  private store = inject(Store);

  goToAddSite = () => this.router.navigate(['/sites-ngrx', 'add']);

  headerData = new HeaderActions('sites-ngrx-list', 'Sites', [], []);
  footerData = new FooterActions([new AddButton('Add Site', this.goToAddSite)]);

  rows: ISite[] = [];
  columns: TableColumn[] = [];

  sites$: Observable<ISite[]>;

  destroy$ = new Subject<void>();

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/sites-ngrx', event.row.site_id]);
    }
  }

  toggleExpandRow(row: ISite) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  addressComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['address1']}, ${rowA['city']}, ${rowA['state']} ${rowA['zip_code']}`;
    const locationB = `${rowB['address1']}, ${rowB['city']}, ${rowB['state']} ${rowB['zip_code']}`;
    return locationA.localeCompare(locationB);
  }

  constructor() {
    this.sites$ = this.store.select(selectSites);
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
      {
        width: 200,
        prop: 'name',
        name: 'Site',
        cellTemplate: this.siteNameTemplate
      },
      {
        width: 250,
        prop: '',
        name: 'Site Address',
        headerTemplate: this.siteAddressHeaderTemplate,
        cellTemplate: this.siteAddressTemplate,
        comparator: this.addressComparator
      },
      {
        width: 200,
        prop: '',
        name: 'Client',
        headerTemplate: this.clientNameHeaderTemplate,
        cellTemplate: this.clientNameTemplate
      }
    ];

    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));

    this.sites$.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe((sites) => {
      this.rows = [...sites];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
