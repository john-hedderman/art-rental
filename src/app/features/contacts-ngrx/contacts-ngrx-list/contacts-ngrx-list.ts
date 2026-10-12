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
import { distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { IContact } from '../../../model/models';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { selectContacts } from '../../../core/+state/core.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Component({
  imports: [PageHeader, NgxDatatableModule, PageFooter],
  selector: 'app-contacts-ngrx-list',
  styleUrl: './contacts-ngrx-list.scss',
  templateUrl: './contacts-ngrx-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100'
  }
})
export class ContactsNgrxList implements OnInit, OnDestroy {
  @ViewChild('contactsTable') table!: DatatableComponent<IContact>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('clientNameHeaderTemplate', { static: true })
  clientNameHeaderTemplate!: TemplateRef<any>;
  @ViewChild('clientNameTemplate', { static: true }) clientNameTemplate!: TemplateRef<any>;
  @ViewChild('phoneHeaderTemplate', { static: true }) phoneHeaderTemplate!: TemplateRef<any>;
  @ViewChild('phoneTemplate', { static: true }) phoneTemplate!: TemplateRef<any>;

  private router = inject(Router);
  private store = inject(Store);

  goToAddContact = () => this.router.navigate(['/contacts-ngrx', 'add']);

  headerData = new HeaderActions('contacts-ngrx-list', 'Contacts', [], []);
  footerData = new FooterActions([new AddButton('Add Contact', this.goToAddContact)]);

  rows: IContact[] = [];
  columns: TableColumn[] = [];

  contacts$: Observable<IContact[]>;

  destroy$ = new Subject<void>();

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/contacts-ngrx', event.row.contact_id]);
    }
  }

  toggleExpandRow(row: IContact) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  nameComparator(rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  clientNameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const clientNameA = `${rowA['client']['name']}`;
    const clientNameB = `${rowB['client']['name']}`;
    return clientNameA.localeCompare(clientNameB);
  }

  constructor() {
    this.contacts$ = this.store.select(selectContacts);
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
        prop: '',
        width: 250,
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator
      },
      {
        width: 200,
        name: 'Client',
        headerTemplate: this.clientNameHeaderTemplate,
        cellTemplate: this.clientNameTemplate,
        comparator: this.clientNameComparator
      },
      {
        width: 150,
        prop: 'phone',
        name: 'Phone',
        headerTemplate: this.phoneHeaderTemplate,
        cellTemplate: this.phoneTemplate
      }
    ];

    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));

    this.contacts$.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe((contacts) => {
      this.rows = [...contacts];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
