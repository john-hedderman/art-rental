import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonbarData, Client, HeaderData } from '../../../model/models';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { OperationsService } from '../../../service/operations-service';
import * as Constants from '../../../constants';
import * as Messages from '../../../shared/messages';

@Component({
  selector: 'app-add-contact',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar, AsyncPipe],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
  standalone: true,
})
export class AddContact implements OnInit {
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
  clientStatus = '';

  clients: Client[] = [];
  clients$: Observable<Client[]> | undefined;

  reloadFromDb() {
    this.dataService
      .load('contacts')
      .subscribe((contacts) => this.dataService.contacts$.next(contacts));
  }

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalContactStatus() {
    this.signalStatus(this.contactStatus, Messages.SAVED_CONTACT, Messages.SAVE_CONTACT_FAILED);
  }

  signalClientStatus(delay?: number) {
    if (this.contactStatus === Constants.SUCCESS) {
      this.signalStatus(
        this.clientStatus,
        Messages.SAVED_CLIENT,
        Messages.SAVE_CLIENT_FAILED,
        delay
      );
    }
  }

  signalResetStatus(delay?: number) {
    if (this.contactStatus === Constants.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      this.contactForm.value.client_id = parseInt(this.contactForm.value.client_id);
      this.contactStatus = await this.saveContact(this.contactForm.value);
      this.clientStatus = await this.updateClient(this.contactForm.value);
      this.signalContactStatus();
      this.signalClientStatus(1500);
      this.signalResetStatus(1500 * 2);
      this.submitted = false;
      this.contactForm.reset();
      if (this.contactStatus === Constants.SUCCESS) {
        this.reloadFromDb();
      }
    }
  }

  async saveContact(formData: any): Promise<string> {
    const collection = Collections.Contacts;
    let result = Constants.SUCCESS;
    try {
      const returnData = await this.dataService.saveDocument(formData, collection);
      if (returnData.modifiedCount === 0) {
        result = Constants.FAILURE;
      }
    } catch (error) {
      console.error('Save contact error:', error);
      result = Constants.FAILURE;
    }
    return result;
  }

  async updateClient(formData: any): Promise<string> {
    const client = this.clients.find((client) => client.client_id === formData.client_id);
    if (!client) {
      console.error('Save client error, could not find the selected client');
      return Constants.FAILURE;
    }
    const collection = Collections.Clients;
    let result = Constants.SUCCESS;
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
        result = Constants.FAILURE;
      }
    } catch (error) {
      console.error('Save client error:', error);
      result = Constants.FAILURE;
    }
    return result;
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataService,
    private operationsService: OperationsService
  ) {
    this.dataService.clients$.pipe(take(1)).subscribe((clients) => {
      this.clients$ = of(clients);
      this.clients = clients;
    });
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      contact_id: Date.now(),
      first_name: [''],
      last_name: [''],
      phone: [''],
      title: [''],
      email: [''],
      client_id: null,
    });
  }
}
