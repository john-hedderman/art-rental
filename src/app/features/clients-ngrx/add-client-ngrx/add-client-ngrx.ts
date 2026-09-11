import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { SaveButton } from '../../../shared/buttons/save-button';
import { ResetButton } from '../../../shared/buttons/reset-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { IClient, IContact } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { environment } from '../../../../environments/environment';
import { ClientsNgrxActions } from '../+state/clients-ngrx.actions';

@Component({
  imports: [PageHeader, ReactiveFormsModule, PageFooter],
  selector: 'app-add-client-ngrx',
  styleUrl: './add-client-ngrx.scss',
  templateUrl: './add-client-ngrx.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class AddClientNgrx extends AddBase implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  goToClientList = () => this.router.navigate(['/clients-ngrx', 'list']);
  clientListLink = new ActionLink(
    'clientListLink',
    'Clients',
    '/clients-ngrx/list',
    '',
    this.goToClientList
  );
  headerData = new HeaderActions('client-add', 'Add Client', [], [this.clientListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  clientForm!: FormGroup;
  submitted = false;

  clientId!: number;

  dbData: IClient = {} as IClient;
  contactsDBData: IContact[] = [];

  editMode = false;

  saveStatus = '';

  contactsTimeoutID = 0;

  async onSubmit(): Promise<void> {
    this.submitForm(this.clientForm, ['clients', 'contacts'], 'client');
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
        client_id: this.clientId
      })
    );
  }

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  trackByContactId(_index: number, v: AbstractControl) {
    return v.value.contact_id;
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  onClickReset() {
    this.resetForm();
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<IClient>(Collections.Clients, 'client_id', this.clientId);
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
    this.clientForm.get('job_ids')?.setValue(this.dbData.job_ids);
    this.clientForm.get('site_ids')?.setValue(this.dbData.site_ids);
    this.clientForm.get('name')?.setValue(this.dbData.name);
    this.clientForm.get('address1')?.setValue(this.dbData.address1);
    this.clientForm.get('address2')?.setValue(this.dbData.address2);
    this.clientForm.get('city')?.setValue(this.dbData.city);
    this.clientForm.get('state')?.setValue(this.dbData.state);
    this.clientForm.get('zip_code')?.setValue(this.dbData.zip_code);
    this.clientForm.get('industry')?.setValue(this.dbData.industry);

    this.populateContactsData();
  }

  populateContactData(contact_id: number) {
    this.http
      .get<IContact[]>(`${environment.apiUrl}/data/contacts/${contact_id}?recordId=contact_id`)
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
    this.contactsTimeoutID = setTimeout(() => {
      for (const contact_id of contact_ids) {
        this.addContact(contact_id);
        this.populateContactData(contact_id);
      }
    }, 100);
  }

  preSave() {
    this.disableSaveBtn();
    const clientId = this.route.snapshot.paramMap.get('id');
    this.clientId = clientId ? +clientId : Date.now();
    this.clientForm.value.client_id = this.clientId;
  }

  async save(): Promise<string> {
    this.saveClient();
    return '';
  }

  async saveClient(): Promise<string> {
    const formData = this.mergeContactIds(this.clientForm.value);

    this.store.dispatch(
      ClientsNgrxActions.addOrEditClient({
        isEdit: this.editMode,
        client: formData
      })
    );

    // FIXME: dummy return for now - will update all other pages' save() methods to be similar, relying on state.opStatus
    return '';
  }

  mergeContactIds(clientFormData: any): any {
    const { contacts, ...allButContacts } = clientFormData;
    const contact_ids = contacts.map((contact: IContact) => contact.contact_id);
    if (this.editMode) {
      return { ...allButContacts, contact_ids };
    }
    return { ...allButContacts, contact_ids, job_ids: [], site_ids: [] };
  }

  // async deleteContacts() {
  //   const collection = Collections.Contacts;
  //   let returnData;
  //   let result = Const.SUCCESS;
  //   try {
  //     returnData = await this.dataService.deleteDocuments(collection, 'client_id', this.clientId);
  //     if (returnData.message.indexOf('failed') !== -1) {
  //       result = Const.FAILURE;
  //     }
  //   } catch (error) {
  //     console.error('Error deleting contacts:', error);
  //     result = Const.FAILURE;
  //   }
  //   return result;
  // }

  // async saveContacts(): Promise<string> {
  //   const contactsFormData = this.clientForm.value.contacts;
  //   const collection = Collections.Contacts;
  //   let result = Const.SUCCESS;
  //   for (const contactFormData of contactsFormData) {
  //     contactFormData.client_id = this.clientId;
  //     try {
  //       const returnData = await this.dataService.saveDocument(contactFormData, collection);
  //       if (!returnData.insertedId) {
  //         result = Const.FAILURE;
  //       }
  //     } catch (error) {
  //       console.error('Error saving contact:', error);
  //       result = Const.FAILURE;
  //     }
  //   }
  //   return result;
  // }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.clientId = 0;
    this.editMode = false;

    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.clientId = +clientId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Client';
    }

    this.clientForm = this.fb.group({
      client_id: this.clientId,
      job_ids: [[]],
      site_ids: [[]],
      name: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      industry: [''],
      contacts: this.fb.array([])
    });

    if (this.editMode) {
      this.populateForm<IClient>(Collections.Clients, 'client_id', this.clientId);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.contactsTimeoutID);
  }
}
