import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, Contact } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import * as Const from '../../../constants';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/buttons/save-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { ResetButton } from '../../../shared/buttons/reset-button';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader, ReactiveFormsModule, PageFooter],
  providers: [MessagesService],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient extends AddBase implements OnInit, OnDestroy {
  goToClientList = () => this.router.navigate(['/clients', 'list']);
  clientListLink = new ActionLink(
    'clientListLink',
    'Clients',
    '/clients/list',
    '',
    this.goToClientList
  );
  headerData = new HeaderActions('client-add', 'Add Client', [], [this.clientListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  dbData: Client = {} as Client;
  contactsDBData: Contact[] = [];
  editMode = false;

  clientForm!: FormGroup;
  submitted = false;

  clientId!: number;

  saveStatus = '';

  preSave() {
    this.disableSaveBtn();
    const clientId = this.route.snapshot.paramMap.get('id');
    this.clientId = clientId ? +clientId : Date.now();
    this.clientForm.value.client_id = this.clientId;
  }

  async save(): Promise<string> {
    const clientStatus = await this.saveClient();
    const deleteContactsStatus = await this.deleteContacts();
    const contactsStatus = await this.saveContacts();
    return this.jobResult([clientStatus, deleteContactsStatus, contactsStatus]);
  }

  async onSubmit(): Promise<void> {
    this.submitForm(this.clientForm, ['clients', 'contacts'], 'client');
  }

  mergeContactIds(clientFormData: any): any {
    const { contacts, ...allButContacts } = clientFormData;
    const contact_ids = contacts.map((contact: Contact) => contact.contact_id);
    return { ...allButContacts, contact_ids, job_ids: [], site_ids: [] };
  }

  async saveClient(): Promise<string> {
    const formData = this.mergeContactIds(this.clientForm.value);
    const collection = Collections.Clients;
    let result = Const.SUCCESS;
    try {
      let returnData;
      if (this.editMode) {
        returnData = await this.dataService.saveDocument(
          formData,
          collection,
          formData.client_id,
          'client_id'
        );
      } else {
        returnData = await this.dataService.saveDocument(formData, collection);
      }
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save client error:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async deleteContacts() {
    const collection = Collections.Contacts;
    let returnData;
    let result = Const.SUCCESS;
    try {
      returnData = await this.dataService.deleteDocuments(collection, 'client_id', this.clientId);
      if (returnData.message.indexOf('failed') !== -1) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Error deleting contacts:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async saveContacts(): Promise<string> {
    const contactsFormData = this.clientForm.value.contacts;
    const collection = Collections.Contacts;
    let result = Const.SUCCESS;
    for (const contactFormData of contactsFormData) {
      contactFormData.client_id = this.clientId;
      try {
        const returnData = await this.dataService.saveDocument(contactFormData, collection);
        if (!returnData.insertedId) {
          result = Const.FAILURE;
        }
      } catch (error) {
        console.error('Error saving contact:', error);
        result = Const.FAILURE;
      }
    }
    return result;
  }

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  trackByContactId(_index: number, v: AbstractControl) {
    return v.value.contact_id;
  }

  addContact(contact_id?: number): void {
    this.contacts.push(
      this.fb.group({
        contact_id: contact_id || Date.now(),
        first_name: [''],
        last_name: [''],
        phone: [''],
        title: [''],
        email: [''],
        client_id: this.clientId,
      })
    );
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  populateContactData(contact_id: number) {
    this.http
      .get<Contact[]>(`http://localhost:3000/data/contacts/${contact_id}?recordId=contact_id`)
      .subscribe((contacts) => {
        if (contacts && contacts.length === 1) {
          const contactDBData = contacts[0];
          if (contactDBData) {
            this.contactsDBData.push(contactDBData);
            const contactControl = this.contacts.controls.find(
              (control) => control.value.contact_id === contactDBData.contact_id
            );
            if (contactControl) {
              contactControl.get('first_name')?.setValue(contactDBData.first_name);
              contactControl.get('last_name')?.setValue(contactDBData.last_name);
              contactControl.get('phone')?.setValue(contactDBData.phone);
              contactControl.get('title')?.setValue(contactDBData.title);
              contactControl.get('email')?.setValue(contactDBData.email);
              contactControl.get('client_id')?.setValue(contactDBData.client_id);
            }
          }
        }
      });
  }

  populateContactsData() {
    this.contacts.clear();
    const contact_ids = this.dbData.contact_ids;
    setTimeout(() => {
      for (const contact_id of contact_ids) {
        this.addContact(contact_id);
        this.populateContactData(contact_id);
      }
    }, 100);
  }

  onClickReset() {
    this.resetForm();
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<Client>(Collections.Clients, 'client_id', this.clientId);
    } else {
      this.clearForm();
      this.contacts.clear();
    }
  }

  clearForm() {
    this.clientForm.reset();
  }

  populateData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.clientForm.get('client_id')?.setValue(this.dbData.client_id);
    this.clientForm.get('name')?.setValue(this.dbData.name);
    this.clientForm.get('address1')?.setValue(this.dbData.address1);
    this.clientForm.get('address2')?.setValue(this.dbData.address2);
    this.clientForm.get('city')?.setValue(this.dbData.city);
    this.clientForm.get('state')?.setValue(this.dbData.state);
    this.clientForm.get('zip_code')?.setValue(this.dbData.zip_code);
    this.clientForm.get('industry')?.setValue(this.dbData.industry);

    this.populateContactsData();
  }

  init() {
    this.clientId = 0;
    this.editMode = false;

    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.clientId = +clientId;
      this.editMode = true;
    }

    this.clientForm = this.fb.group({
      client_id: this.clientId,
      name: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      industry: [''],
      contacts: this.fb.array([]),
    });

    if (this.editMode) {
      this.populateForm<Client>(Collections.Clients, 'client_id', this.clientId);
    }
  }

  constructor(private fb: FormBuilder, private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
