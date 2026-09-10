import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { delay, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { TableColumn } from '@swimlane/ngx-datatable';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
} from '../../../shared/actions/action-data';
import { IClient, IContact, IJob, ISite } from '../../../model/models';
import * as Const from '../../../constants';
import { ContactsTable } from '../../../shared/components/contacts-table/contacts-table';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { selectContacts, selectJobs, selectSites } from '../../../core/+state/core.selectors';
import { Store } from '@ngrx/store';
import { selectClientById } from '../+state/clients-ngrx.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';

@Component({
  imports: [PageHeader, AsyncPipe, RouterLink, ContactsTable, PageFooter],
  selector: 'app-client-ngrx-detail',
  styleUrl: './client-ngrx-detail.scss',
  templateUrl: './client-ngrx-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ClientNgrxDetail extends DetailBase implements OnInit, OnDestroy {
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;

  private router = inject(Router);
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  goToClientList = () => this.router.navigate(['/clients-ngrx', 'list']);
  goToEditClient = () => this.router.navigate(['/clients', this.clientId, 'edit']);
  clientListLink = new ActionLink(
    'clientListLink',
    'Clients',
    '/clients-ngrx/list',
    '',
    this.goToClientList
  );
  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditClient
  );
  headerData = new HeaderActions('client-detail', 'Client detail', [], [this.clientListLink.data]);
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  client$: Observable<IClient> | undefined;
  contacts$: Observable<IContact[]>;
  jobs$: Observable<IJob[]> | undefined;
  sites$: Observable<ISite[]> | undefined;

  clientId = 0;

  SITE_TBD_NAME = Const.SITE_TBD_NAME;

  rows: IContact[] = [];
  columns: TableColumn[] = [];

  destroy$ = new Subject<void>();

  deleteStatus = '';

  override preDelete(): void {}

  override async delete(): Promise<string> {
    // const clientStatus = await this.deleteClient();
    // const contactsStatus = await this.deleteContacts();
    // const sitesStatus = await this.deleteSites();
    // return this.jobResult([clientStatus, contactsStatus, sitesStatus]);
    return '';
  }

  override postDelete() {}

  async onClickDelete() {
    this.deleteAndReload(['clients', 'contacts', 'sites'], this.goToClientList);
  }

  nameComparator(valueA: any, valueB: any, rowA: any, rowB: any): number {
    const nameA = `${rowA['first_name']} ${rowA['last_name']}`;
    const nameB = `${rowB['first_name']} ${rowB['last_name']}`;
    return nameA.localeCompare(nameB);
  }

  setClientId() {
    this.clientId = +(this.route.snapshot.paramMap.get('id') || 0);
  }

  constructor() {
    super();
    this.setClientId();
    this.client$ = this.store.select(selectClientById(this.clientId));
    this.contacts$ = this.store
      .select(selectContacts)
      .pipe(
        map((contacts: IContact[]) =>
          contacts.filter((contact) => contact.client_id === this.clientId)
        )
      );
    this.jobs$ = this.store
      .select(selectJobs)
      .pipe(map((jobs: IJob[]) => jobs.filter((job) => job.client_id === this.clientId)));
    this.sites$ = this.store
      .select(selectSites)
      .pipe(map((sites: ISite[]) => sites.filter((site) => site.client_id === this.clientId)));
  }

  ngOnInit(): void {
    this.columns = [
      {
        name: 'Name',
        cellTemplate: this.nameTemplate,
        comparator: this.nameComparator
      },
      {
        prop: 'title',
        name: 'Title'
      },
      {
        prop: 'phone',
        name: 'Phone'
      }
    ];

    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));

    this.contacts$.pipe(takeUntil(this.destroy$)).subscribe((contacts) => {
      this.rows = [...contacts];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
