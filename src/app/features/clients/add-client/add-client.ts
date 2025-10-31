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

  editObj: Client = {} as Client;
  editMode = false;

  clientForm!: FormGroup;
  submitted = false;

  clientId = '';

  client_id!: number;

  clientStatus = '';
  contactsStatus = '';

  contactsTimeoutId: number | undefined;
  resetTimeoutId: number | undefined;

  updateData() {
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

  signalContactsStatus() {
    if (this.clientStatus === Constants.SUCCESS) {
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
      this.resetTimeoutId = setTimeout(() => {
        this.signalStatus('', '', '');
      }, 3000);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.clientForm.valid) {
      if (this.editMode) {
      } else {
        this.clientForm.value.client_id = Date.now();
        this.clientStatus = await this.saveClient(this.clientForm.value);
        this.contactsStatus = await this.saveContacts(
          this.clientForm.value.contacts,
          this.clientForm.value.client_id
        );
        this.signalClientStatus();
        this.signalContactsStatus();
        this.signalResetStatus();
        this.resetForm();
      }
      if (this.clientStatus === Constants.SUCCESS || this.contactsStatus === Constants.SUCCESS) {
        this.updateData();
      }
    }
  }

  mergeContacts(clientData: any): any {
    const { contacts, ...allButContacts } = clientData;
    const contact_ids = contacts.map((contact: ContactTest) => contact.contact_id);
    return { ...allButContacts, contact_ids, job_ids: [] };
  }

  async saveClient(clientData: any): Promise<string> {
    const collectionName = Collections.Clients;
    const finalClientData = this.mergeContacts(clientData);

    let result = Constants.SUCCESS;
    try {
      let returnData;
      if (this.editMode) {
        returnData = await this.dataService.saveDocument(
          finalClientData,
          collectionName,
          finalClientData.client_id,
          'client_id'
        );
      } else {
        returnData = await this.dataService.saveDocument(finalClientData, collectionName);
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

  async saveContacts(contactsData: any[], client_id: number): Promise<string> {
    const collectionName = Collections.ContactsTest;
    const finalContactsData = contactsData.map((contact: ContactTest) => {
      const { client, ...allButClient } = contact;
      return { ...allButClient, client_id };
    });

    let result = Constants.SUCCESS;
    try {
      for (const contactData of finalContactsData) {
        let returnData;
        if (this.editMode) {
        } else {
          returnData = await this.dataService.saveDocument(contactData, collectionName);
        }
        if (returnData.modifiedCount === 0) {
          result = Constants.FAILURE;
        }
      }
    } catch (error) {
      console.error('Save contacts error:', error);
      result = Constants.FAILURE;
    }
    return result;
  }

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  newContact(): FormGroup {
    return this.fb.group({
      contact_id: Date.now(),
      first_name: [''],
      last_name: [''],
      phone: [''],
      title: [''],
      email: [''],
      client: this.fb.group({
        id: [this.client_id],
      }),
    });
  }

  trackById(index: number, v: AbstractControl) {
    return v.value.contact_id;
  }

  resetForm() {
    if (this.editMode) {
      this.repopulateEditForm();
    } else {
      this.clientForm.reset();
    }
    this.submitted = false;
  }

  addContact(): void {
    this.contacts.push(this.newContact());
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  repopulateEditForm() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.clientForm.get('client_id')?.setValue(this.editObj.client_id);

    this.clientForm.get('name')?.setValue(this.editObj.name);
    this.clientForm.get('address1')?.setValue(this.editObj.address1);
    this.clientForm.get('address2')?.setValue(this.editObj.address2);
    this.clientForm.get('city')?.setValue(this.editObj.city);
    this.clientForm.get('state')?.setValue(this.editObj.state);
    this.clientForm.get('zip_code')?.setValue(this.editObj.zip_code);
    this.clientForm.get('industry')?.setValue(this.editObj.industry);
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
    this.clientForm = this.fb.group({
      client_id: this.client_id,
      name: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      industry: [''],
      contacts: this.fb.array([]),
    });

    this.clientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.clientId) {
      this.editMode = true;
      this.http
        .get<Client>(`http://localhost:3000/data/art/${this.clientId}?recordId=art_id`)
        .subscribe((client) => {
          if (client) {
            this.editObj = client;
            this.repopulateEditForm();
          }
        });
    } else {
      this.editMode = false;
    }
  }

  ngOnDestroy(): void {
    if (this.contactsTimeoutId) {
      clearTimeout(this.contactsTimeoutId);
    }
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
}
