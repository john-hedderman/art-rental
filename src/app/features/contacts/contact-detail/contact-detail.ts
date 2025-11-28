import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Contact } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { DeleteButton } from '../../../shared/components/buttons/delete-button/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-contact-detail',
  imports: [PageHeader, AsyncPipe, PageFooter],
  providers: [MessagesService],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
  standalone: true,
})
export class ContactDetail implements OnDestroy {
  goToEditContact = () => this.router.navigate(['/contacts', this.contactId, 'edit']);
  goToContactList = () => this.router.navigate(['/contacts', 'list']);

  contactListLink = new ActionLink(
    'contactListLink',
    'Contacts',
    '/contacts/list',
    '',
    this.goToContactList
  );
  headerData = new HeaderActions(
    'contact-detail',
    'Contact detail',
    [],
    [this.contactListLink.data]
  );

  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditContact
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  contactId = 0;
  clientId = 0;

  contact$: Observable<Contact> | undefined;
  client$: Observable<Client> | undefined;

  clients: Client[] = [];

  deleteStatus = '';
  clientStatus = '';
  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  reloadFromDb() {
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  async onClickDelete() {
    this.deleteStatus = await this.operationsService.deleteDocument(
      Collections.Contacts,
      'contact_id',
      this.contactId
    );
    this.clientStatus = await this.updateClient();
    this.messagesService.showStatus(
      this.deleteStatus,
      Msgs.DELETED_CONTACT,
      Msgs.DELETE_CONTACT_FAILED
    );
    this.messagesService.showStatus(this.clientStatus, Msgs.SAVED_CLIENT, Msgs.SAVE_CLIENT_FAILED);
    this.messagesService.clearStatus();
    if (this.deleteStatus === Const.SUCCESS || this.clientStatus === Const.SUCCESS) {
      this.reloadFromDb();
    }
  }

  async updateClient(): Promise<string> {
    const client = this.clients.find((client) => client.client_id === this.clientId);
    if (!client) {
      console.error('Save client error, could not find the client');
      return Const.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      client.contact_ids = client.contact_ids.filter((contact_id) => contact_id !== this.contactId);
      delete (client as any)._id;
      const returnData = await this.dataService.saveDocument(
        client,
        collection,
        this.clientId,
        'client_id'
      );
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save client error:', error);
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
    private operationsService: OperationsService,
    private messagesService: MessagesService
  ) {
    combineLatest({
      contacts: this.dataService.contacts$,
      clients: this.dataService.clients$,
      contactId: this.getContactId(),
    })
      .pipe(take(1))
      .subscribe(({ contacts, clients, contactId }) => {
        this.contactId = contactId;
        this.clients = clients;
        let contact = contacts.find((contact) => contact.contact_id === contactId)!;
        if (contact) {
          let client = clients.find((client) => client.client_id === contact.client_id);
          if (client) {
            contact = { ...contact, client };
            this.client$ = of(client);
            this.clientId = client.client_id;
          }
          this.contact$ = of(contact);
        }
      });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
