import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule, TableColumn } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Contact } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Util } from '../../../shared/util/util';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';

@Component({
  selector: 'app-contact-list',
  imports: [NgxDatatableModule, PageHeader, PageFooter],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class ContactList implements OnInit {
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

  goToAddContact = () => this.router.navigate(['/contacts', 'add']);

  headerData = new HeaderActions('contact-list', 'Contacts', [], []);
  footerData = new FooterActions([new AddButton('Add Contact', this.goToAddContact)]);

  rows: Contact[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

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

  constructor(private dataService: DataService, private router: Router) {
    combineLatest({
      contacts: this.dataService.contacts$,
      clients: this.dataService.clients$,
    })
      .pipe(take(1))
      .subscribe(({ contacts, clients }) => {
        const fullContacts = contacts.map((contact) => {
          const client = clients.find((client) => client.client_id === contact.client_id);
          return { ...contact, client };
        });
        this.rows = [...fullContacts];
      });
  }

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
