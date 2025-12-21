import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Contact } from '../../../model/models';
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
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { Util } from '../../../shared/util/util';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';

@Component({
  selector: 'app-contact-detail',
  imports: [PageHeader, AsyncPipe, PageFooter, RouterLink],
  providers: [MessagesService],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
  standalone: true,
})
export class ContactDetail extends DetailBase implements OnInit, OnDestroy {
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

  readonly OP_SUCCESS = Const.SUCCESS;
  readonly OP_FAILURE = Const.FAILURE;

  override preDelete(): void {}

  override async delete(): Promise<string> {
    const contactStatus = await this.deleteContact();
    const clientStatus = await this.updateClient();
    return this.jobResult([clientStatus, contactStatus]);
  }

  override postDelete() {
    this.messagesService.showStatus(
      this.deleteStatus,
      Util.replaceTokens(Msgs.DELETED, { entity: 'contact' }),
      Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'contact' })
    );
    this.messagesService.clearStatus();
  }

  async onClickDelete() {
    this.deleteAndReload(['contacts', 'clients'], this.goToContactList);
  }

  async deleteContact(): Promise<string> {
    return await this.operationsService.deleteDocument(
      Collections.Contacts,
      'contact_id',
      this.contactId
    );
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

  init() {
    this.getCombinedData$().subscribe(({ contactId, contacts, clients }) => {
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

  getCombinedData$(): Observable<{
    contactId: number;
    contacts: Contact[];
    clients: Client[];
  }> {
    return combineLatest({
      contactId: this.getContactId(),
      contacts: this.dataService.contacts$,
      clients: this.dataService.clients$,
    }).pipe(take(1));
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private operationsService: OperationsService,
    private messagesService: MessagesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
