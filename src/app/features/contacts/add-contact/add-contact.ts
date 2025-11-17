import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonbarData, Client, Contact, HeaderData } from '../../../model/models';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-contact',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar, AsyncPipe],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
  standalone: true,
})
export class AddContact implements OnInit, OnDestroy {
  goToContactList = () => {
    this.router.navigate(['/contacts', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Contact',
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToContactListLink',
        label: 'Contact list',
        routerLink: '/contacts/list',
        linkClass: '',
        clickHandler: this.goToContactList,
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
        clickHandler: this.goToContactList,
      },
    ],
  };

  contactForm!: FormGroup;
  submitted = false;

  contactStatus = '';
  oldClientStatus = '';
  clientStatus = '';

  clients: Client[] = [];
  clients$: Observable<Client[]> | undefined;

  contactDBData: Contact = {} as Contact;

  contactId!: number;
  editMode = false;

  reloadFromDb() {
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalContactStatus() {
    this.signalStatus(this.contactStatus, Msgs.SAVED_CONTACT, Msgs.SAVE_CONTACT_FAILED);
  }

  signalClientStatus(delay?: number) {
    if (this.contactStatus === Const.SUCCESS) {
      this.signalStatus(this.clientStatus, Msgs.SAVED_CLIENT, Msgs.SAVE_CLIENT_FAILED, delay);
    }
  }

  signalResetStatus(delay?: number) {
    if (this.contactStatus === Const.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      this.contactForm.value.client_id = parseInt(this.contactForm.value.client_id);
      this.contactStatus = await this.saveContact(this.contactForm.value);
      if (this.editMode) {
        this.oldClientStatus = await this.updateOldClient(
          this.contactDBData,
          this.contactForm.value
        );
      }
      this.clientStatus = await this.updateClient(this.contactForm.value);
      this.signalContactStatus();
      this.signalClientStatus(1500);
      this.signalResetStatus(1500 * 2);
      this.submitted = false;
      if (this.editMode) {
        this.populateForm();
      } else {
        this.contactForm.reset();
      }
      if (this.contactStatus === Const.SUCCESS) {
        this.reloadFromDb();
      }
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
      delete (oldClient as any)._id; // necessary?
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
      delete (client as any)._id; // necessary?
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

  populateContactData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.contactForm.get('contact_id')?.setValue(this.contactDBData.contact_id);
    this.contactForm.get('first_name')?.setValue(this.contactDBData.first_name);
    this.contactForm.get('last_name')?.setValue(this.contactDBData.last_name);
    this.contactForm.get('phone')?.setValue(this.contactDBData.phone);
    this.contactForm.get('title')?.setValue(this.contactDBData.title);
    this.contactForm.get('email')?.setValue(this.contactDBData.email);
    this.contactForm.get('client_id')?.setValue(this.contactDBData.client_id);
  }

  populateForm() {
    this.http
      .get<Contact[]>(`http://localhost:3000/data/contacts/${this.contactId}?recordId=contact_id`)
      .subscribe((contacts) => {
        if (contacts && contacts.length === 1) {
          this.contactDBData = contacts[0];
          if (this.contactDBData) {
            this.populateContactData();
          }
        }
      });
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataService,
    private operationsService: OperationsService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
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
      this.populateForm();
    }

    this.contactForm = this.fb.group({
      contact_id: this.contactId,
      first_name: [''],
      last_name: [''],
      phone: [''],
      title: [''],
      email: [''],
      client_id: null,
    });
  }

  ngOnDestroy(): void {
    this.signalResetStatus(1500);
  }
}
