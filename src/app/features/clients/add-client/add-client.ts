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
import { ButtonbarData, Client, ContactTest, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Collections } from '../../../shared/enums/collections';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import * as Constants from '../../../shared/constants';

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
  goToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Client',
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToClientListLink',
        label: 'Client list',
        routerLink: '/clients/list',
        linkClass: '',
        clickHandler: this.goToClientList,
      },
    ],
  };

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
  contactsDBData: ContactTest[] = [];
  editMode = false;

  clientForm!: FormGroup;
  submitted = false;

  clientId!: number;

  clientStatus = '';
  deleteContactsStatus = '';
  contactsStatus = '';

  contactsTimeoutId: number | undefined;
  resetTimeoutId: number | undefined;

  reloadFromDb() {
    this.dataService
      .load('clients')
      .subscribe((clients) => this.dataService.clients$.next(clients));
    this.dataService
      .load('contacts_test')
      .subscribe((contacts) => this.dataService.contacts_test$.next(contacts));
  }

  signalStatus(status: string, success: string, failure: string) {
    this.operationsService.setStatus({ status, success, failure });
  }

  signalClientStatus() {
    this.signalStatus(this.clientStatus, Constants.CLIENT_SUCCESS, Constants.CLIENT_FAILURE);
  }

  clearContactsTimeoutId() {
    if (this.contactsTimeoutId) {
      clearTimeout(this.contactsTimeoutId);
    }
  }

  clearResetTimeoutId() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  signalContactsStatus() {
    if (this.clientStatus === Constants.SUCCESS) {
      this.clearContactsTimeoutId();
      this.contactsTimeoutId = setTimeout(() => {
        this.signalStatus(
          this.contactsStatus,
          Constants.CONTACTS_SUCCESS,
          Constants.CONTACTS_FAILURE
        );
      }, 1500);
    }
  }

  signalResetStatus() {
    if (this.clientStatus === Constants.SUCCESS && this.contactsStatus === Constants.SUCCESS) {
      this.clearResetTimeoutId();
      this.resetTimeoutId = setTimeout(() => {
        this.signalStatus('', '', '');
      }, 3000);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.clientForm.valid) {
      this.clientStatus = await this.saveClient(this.clientForm.value);
      this.deleteContactsStatus = await this.deleteContacts();
      this.contactsStatus = await this.saveContacts(this.clientForm.value.contacts);
      this.signalClientStatus();
      this.signalContactsStatus();
      this.signalResetStatus();
      this.submitted = false;
      if (this.editMode) {
        this.populateForm();
      } else {
        this.contacts.clear();
        this.clientForm.reset();
      }

      if (this.clientStatus === Constants.SUCCESS || this.contactsStatus === Constants.SUCCESS) {
        this.reloadFromDb();
      }
    }
  }

  mergeContactIds(clientFormData: any): any {
    const { contacts, ...allButContacts } = clientFormData;
    const contact_ids = contacts.map((contact: ContactTest) => contact.contact_id);
    return { ...allButContacts, contact_ids, job_ids: [] };
  }

  async saveClient(clientFormData: any): Promise<string> {
    const collection = Collections.Clients;
    const formData = this.mergeContactIds(clientFormData);

    let result = Constants.SUCCESS;
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
        result = Constants.FAILURE;
      }
    } catch (error) {
      console.error('Save client error:', error);
      result = Constants.FAILURE;
    }
    return result;
  }

  async deleteContacts() {
    const collection = Collections.ContactsTest;
    let returnData;
    let result = Constants.SUCCESS;
    try {
      returnData = await this.dataService.deleteDocuments(collection, this.clientId, 'client_id');
      if (returnData.message.indexOf('failed') !== -1) {
        result = Constants.FAILURE;
      }
    } catch (error) {
      console.error('Error deleting contacts:', error);
      result = Constants.FAILURE;
    }
    return result;
  }

  async saveContacts(contactsFormData: any[]): Promise<string> {
    const collection = Collections.ContactsTest;
    let returnData;
    let result = Constants.SUCCESS;
    for (const contactFormData of contactsFormData) {
      try {
        returnData = await this.dataService.saveDocument(contactFormData, collection);
        if (!returnData.insertedId) {
          result = Constants.FAILURE;
        }
      } catch (error) {
        console.error('Error saving contact:', error);
        result = Constants.FAILURE;
      }
    }
    return result;
  }

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  newContact(contact_id?: number): FormGroup {
    return this.fb.group({
      contact_id: contact_id || Date.now(),
      first_name: [''],
      last_name: [''],
      phone: [''],
      title: [''],
      email: [''],
      client_id: this.clientId,
    });
  }

  trackById(_index: number, v: AbstractControl) {
    return v.value.contact_id;
  }

  addContact(contact_id?: number): void {
    this.contacts.push(this.newContact(contact_id));
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  populateContactData(contact_id: number) {
    this.http
      .get<ContactTest[]>(
        `http://localhost:3000/data/contacts_test/${contact_id}?recordId=contact_id`
      )
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

    this.editMode = false;
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.editMode = true;
      this.clientId = +clientId;
      this.clientForm.value.client_id = this.clientId;
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.signalResetStatus();
    this.clearContactsTimeoutId();
    this.clearResetTimeoutId();
  }
}
