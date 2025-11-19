import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonbarData, Client, Contact, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msg from '../../../shared/messages';
import { ActionLink, HeaderActions } from '../../../shared/actions/action-data';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient implements OnInit, OnDestroy {
  goBack = () => {
    if (this.editMode) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients', 'list']);
    }
  };
  goToClientList = () => this.router.navigate(['/clients', 'list']);

  clientListLink = new ActionLink(
    'clientListLink',
    'Clients',
    '/clients/list',
    '',
    this.goToClientList
  );
  headerData = new HeaderActions('client-add', 'Add Client', [], [this.clientListLink.data]);

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'saveBtn',
        label: 'Save',
        type: 'submit',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: null,
      },
      {
        id: 'cancelBtn',
        label: 'Cancel',
        type: 'button',
        buttonClass: 'btn btn-outline-secondary ms-3',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goBack,
      },
    ],
  };

  clientDBData: Client = {} as Client;
  contactsDBData: Contact[] = [];
  editMode = false;

  clientForm!: FormGroup;
  submitted = false;

  clientId!: number;

  clientStatus = '';
  deleteContactsStatus = '';
  contactsStatus = '';

  initialContactsCount = 0;

  reloadFromDb() {
    this.dataService
      .load('clients')
      .subscribe((clients) => this.dataService.clients$.next(clients));
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalClientStatus() {
    this.signalStatus(this.clientStatus, Msg.SAVED_CLIENT, Msg.SAVE_CLIENT_FAILED);
  }

  signalContactsStatus(delay?: number) {
    if (this.clientStatus === Const.SUCCESS) {
      this.signalStatus(this.contactsStatus, Msg.SAVED_CONTACTS, Msg.SAVE_CONTACTS_FAILED, delay);
    }
  }

  signalResetStatus(delay?: number) {
    if (this.clientStatus === Const.SUCCESS && this.contactsStatus === Const.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.clientForm.valid) {
      this.clientStatus = await this.saveClient(this.clientForm.value);
      this.deleteContactsStatus = await this.deleteContacts();
      this.contactsStatus = await this.saveContacts(this.clientForm.value.contacts);
      this.signalClientStatus();
      if (this.initialContactsCount === 0 && this.clientForm.value.contacts.length === 0) {
        this.signalResetStatus(1500);
      } else {
        this.signalContactsStatus(1500);
        this.signalResetStatus(1500 * 2);
      }
      this.submitted = false;
      if (this.editMode) {
        this.populateForm();
      } else {
        this.contacts.clear();
        this.clientForm.reset();
      }

      if (this.clientStatus === Const.SUCCESS || this.contactsStatus === Const.SUCCESS) {
        this.reloadFromDb();
      }
    }
  }

  mergeContactIds(clientFormData: any): any {
    const { contacts, ...allButContacts } = clientFormData;
    const contact_ids = contacts.map((contact: Contact) => contact.contact_id);
    return { ...allButContacts, contact_ids, job_ids: [] };
  }

  async saveClient(clientFormData: any): Promise<string> {
    const collection = Collections.Clients;
    const formData = this.mergeContactIds(clientFormData);
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
      returnData = await this.dataService.deleteDocuments(collection, this.clientId, 'client_id');
      if (returnData.message.indexOf('failed') !== -1) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Error deleting contacts:', error);
      result = Const.FAILURE;
    }
    return result;
  }

  async saveContacts(contactsFormData: any[]): Promise<string> {
    const collection = Collections.Contacts;
    let returnData;
    let result = Const.SUCCESS;
    for (const contactFormData of contactsFormData) {
      try {
        returnData = await this.dataService.saveDocument(contactFormData, collection);
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
            const contactsControls = this.contacts.controls;
            const contactControl = contactsControls.find(
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
    const contact_ids = this.clientDBData.contact_ids;
    this.initialContactsCount = contact_ids.length;
    for (const contact_id of contact_ids) {
      this.addContact(contact_id);
      this.populateContactData(contact_id);
    }
  }

  populateClientData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.clientForm.get('client_id')?.setValue(this.clientDBData.client_id);
    this.clientForm.get('name')?.setValue(this.clientDBData.name);
    this.clientForm.get('address1')?.setValue(this.clientDBData.address1);
    this.clientForm.get('address2')?.setValue(this.clientDBData.address2);
    this.clientForm.get('city')?.setValue(this.clientDBData.city);
    this.clientForm.get('state')?.setValue(this.clientDBData.state);
    this.clientForm.get('zip_code')?.setValue(this.clientDBData.zip_code);
    this.clientForm.get('industry')?.setValue(this.clientDBData.industry);
  }

  populateForm() {
    this.http
      .get<Client[]>(`http://localhost:3000/data/clients/${this.clientId}?recordId=client_id`)
      .subscribe((clients) => {
        if (clients && clients.length === 1) {
          this.clientDBData = clients[0];
          if (this.clientDBData) {
            this.populateClientData();
            this.populateContactsData();
          }
        }
      });
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private operationsService: OperationsService
  ) {}

  ngOnInit(): void {
    this.clientId = Date.now();
    this.editMode = false;
    this.initialContactsCount = 0;

    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.clientId = +clientId;
      this.editMode = true;
      this.populateForm();
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
  }

  ngOnDestroy(): void {
    this.signalResetStatus();
  }
}
