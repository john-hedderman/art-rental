import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Contact } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';

@Component({
  selector: 'app-add-contact',
  imports: [PageHeader, ReactiveFormsModule, PageFooter, AsyncPipe, RouterLink],
  providers: [MessagesService],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
  standalone: true,
})
export class AddContact extends AddBase implements OnInit, OnDestroy {
  goToContactList = () => this.router.navigate(['/contacts', 'list']);
  contactListLink = new ActionLink(
    'contactListLink',
    'Contacts',
    '/contacts/list',
    '',
    this.goToContactList
  );
  headerData = new HeaderActions('contact-add', 'Add Contact', [], [this.contactListLink.data]);
  resetButton = new ActionButton(
    'resetBtn',
    'Reset',
    'button',
    'btn btn-outline-secondary ms-3',
    false,
    null,
    null,
    this.onClickReset.bind(this)
  );
  footerData = new FooterActions([new SaveButton(), this.resetButton, new CancelButton()]);

  contactForm!: FormGroup;
  submitted = false;

  contactStatus = '';
  oldClientStatus = '';
  clientStatus = '';

  clients: Client[] = [];
  clients$: Observable<Client[]> | undefined;

  dbData: Contact = {} as Contact;

  contactId!: number;
  editMode = false;

  onClickReset() {
    this.resetForm();
    const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
    if (this.editMode) {
      const clientDbId = this.dbData.client_id.toString();
      for (const option of clientSelectEl.options) {
        if (option.value === clientDbId) {
          option.selected = true;
        } else {
          option.selected = false;
        }
      }
    } else {
      clientSelectEl.options[0].selected = true;
    }
    clientSelectEl.dispatchEvent(new Event('change')); // triggers onSelectClient
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<Contact>(Collections.Contacts, 'contact_id', this.contactId);
    } else {
      this.contactForm.reset();
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      this.contactId = Date.now();
      const contactId = this.route.snapshot.paramMap.get('id');
      if (contactId) {
        this.contactId = +contactId;
      }
      this.contactForm.value.contact_id = this.contactId;
      this.contactForm.value.client_id = parseInt(this.contactForm.value.client_id);
      this.contactStatus = await this.saveContact(this.contactForm.value);
      if (this.editMode) {
        this.oldClientStatus = await this.updateOldClient(this.dbData, this.contactForm.value);
      }
      this.clientStatus = await this.updateClient(this.contactForm.value);
      this.messagesService.showStatus(
        this.contactStatus,
        Msgs.SAVED_CONTACT,
        Msgs.SAVE_CONTACT_FAILED
      );
      this.messagesService.showStatus(
        this.clientStatus,
        Msgs.SAVED_CLIENT,
        Msgs.SAVE_CLIENT_FAILED
      );
      this.messagesService.clearStatus();
      this.resetForm();
      this.dataService.reloadData(['contacts', 'clients']);
    }
  }

  async saveContact(formData: any): Promise<string> {
    const collection = Collections.Contacts;
    let result = Const.SUCCESS;
    try {
      let returnData;
      if (this.editMode) {
        returnData = await this.dataService.saveDocument(
          formData,
          collection,
          formData.contact_id,
          'contact_id'
        );
      } else {
        returnData = await this.dataService.saveDocument(formData, collection);
      }
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save contact error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async updateOldClient(dbData: any, formData: any): Promise<string> {
    const oldClient = this.clients.find((client) => client.client_id === dbData.client_id);
    const client = this.clients.find((client) => client.client_id === formData.client_id);
    if (oldClient === client) {
      return Const.SUCCESS;
    }
    if (!oldClient) {
      console.error('Save client error, could not find the previous client');
      return Const.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      oldClient.contact_ids = oldClient.contact_ids.filter(
        (contact_id) => contact_id !== this.contactId
      );
      delete (oldClient as any)._id;
      const returnData = await this.dataService.saveDocument(
        oldClient,
        collection,
        dbData.client_id,
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

  async updateClient(formData: any): Promise<string> {
    const client = this.clients.find((client) => client.client_id === formData.client_id);
    if (!client) {
      console.error('Save client error, could not find the selected client');
      return Const.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      client.contact_ids.push(formData.contact_id);
      delete (client as any)._id;
      const returnData = await this.dataService.saveDocument(
        client,
        collection,
        formData.client_id,
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

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.contactForm.get('first_name')?.enable();
      this.contactForm.get('last_name')?.enable();
      this.contactForm.get('phone')?.enable();
      this.contactForm.get('title')?.enable();
      this.contactForm.get('email')?.enable();
    } else {
      this.contactForm.reset();
      this.contactForm.get('first_name')?.disable();
      this.contactForm.get('last_name')?.disable();
      this.contactForm.get('phone')?.disable();
      this.contactForm.get('title')?.disable();
      this.contactForm.get('email')?.disable();
      const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
      clientSelectEl.options[0].selected = true;
    }
  }

  populateData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.contactForm.get('contact_id')?.setValue(this.dbData.contact_id);
    this.contactForm.get('first_name')?.setValue(this.dbData.first_name);
    this.contactForm.get('last_name')?.setValue(this.dbData.last_name);
    this.contactForm.get('phone')?.setValue(this.dbData.phone);
    this.contactForm.get('title')?.setValue(this.dbData.title);
    this.contactForm.get('email')?.setValue(this.dbData.email);
    this.contactForm.get('client_id')?.setValue(this.dbData.client_id);
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messagesService: MessagesService
  ) {
    super();
    const segments = this.route.snapshot.url.map((x) => x.path);
    if (segments[segments.length - 1] === 'edit') {
      this.headerData.data.headerTitle = 'Edit Contact';
    }
    this.dataService.clients$.pipe(take(1)).subscribe((clients) => {
      this.clients$ = of(clients);
      this.clients = clients;
    });
  }

  ngOnInit(): void {
    this.contactId = Date.now();
    this.editMode = false;

    const contactId = this.route.snapshot.paramMap.get('id');
    if (contactId) {
      this.contactId = +contactId;
      this.editMode = true;
      this.populateForm<Contact>(Collections.Contacts, 'contact_id', this.contactId);
    }

    this.contactForm = this.fb.group({
      contact_id: this.contactId,
      first_name: [{ value: '', disabled: this.editMode ? false : true }],
      last_name: [{ value: '', disabled: this.editMode ? false : true }],
      phone: [{ value: '', disabled: this.editMode ? false : true }],
      title: [{ value: '', disabled: this.editMode ? false : true }],
      email: [{ value: '', disabled: this.editMode ? false : true }],
      client_id: [''],
    });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
