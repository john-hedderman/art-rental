import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonbarData, Client, Contact, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';

@Component({
  selector: 'app-contact-detail',
  imports: [PageHeader, AsyncPipe, Buttonbar],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
  standalone: true,
})
export class ContactDetail {
  goToEditContact = () => {
    this.router.navigate(['/contacts', this.contactId, 'edit']);
  };
  goToContactList = () => {
    this.router.navigate(['/contacts', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Contact detail',
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToContactListLink',
        label: 'Contacts list',
        routerLink: '/contacts/list',
        linkClass: '',
        clickHandler: this.goToContactList,
      },
    ],
  };

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'editContactBtn',
        label: 'Edit',
        type: 'button',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goToEditContact,
      },
      {
        id: 'deleteContactBtn',
        label: 'Delete',
        type: 'button',
        buttonClass: 'btn btn-danger ms-3',
        disabled: false,
        dataBsToggle: 'modal',
        dataBsTarget: '#confirmModal',
        clickHandler: null,
      },
    ],
  };

  contactId = 0;

  contact$: Observable<Contact> | undefined;
  client$: Observable<Client> | undefined;

  deleteStatus = '';
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalContactStatus() {
    this.signalStatus(this.deleteStatus, Msgs.DELETED_CONTACT, Msgs.DELETE_CONTACT_FAILED);
  }

  signalResetStatus(delay?: number) {
    if (this.deleteStatus === Const.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  reloadFromDb() {
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  async onClickDelete() {
    this.deleteStatus = await this.deleteDocument();
    this.signalContactStatus();
    this.signalResetStatus(1500);
    if (this.deleteStatus === Const.SUCCESS) {
      this.reloadFromDb();
    }
  }

  async deleteDocument(): Promise<string> {
    const collectionName = Collections.Contacts;
    let result = Const.SUCCESS;
    try {
      const returnData = await this.dataService.deleteDocument(
        collectionName,
        this.contactId,
        'contact_id'
      );
      if (returnData.deletedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Delete error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  getContactId(): Observable<number> {
    return this.route.paramMap.pipe(map((params) => +params.get('id')!));
  }

  constructor(
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private operationsService: OperationsService
  ) {
    combineLatest({
      contacts: this.dataService.contacts$,
      clients: this.dataService.clients$,
      contactId: this.getContactId(),
    })
      .pipe(take(1))
      .subscribe(({ contacts, clients, contactId }) => {
        this.contactId = contactId;
        let contact = contacts.find((contact) => contact.contact_id === contactId)!;
        if (contact) {
          let client = clients.find((client) => client.client_id === contact?.client_id);
          if (client) {
            contact = { ...contact, client };
            this.client$ = of(client);
          }
          this.contact$ = of(contact);
        }
      });
  }
}
