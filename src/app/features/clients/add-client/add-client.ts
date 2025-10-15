import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ContactTest, HeaderData } from '../../../model/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader, ReactiveFormsModule],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient implements OnInit {
  goToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Client',
    headerButtons: [
      {
        id: 'goToClientListBtn',
        label: 'Client list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToClientList,
      },
    ],
  };

  clientForm!: FormGroup;
  submitted = false;
  client_id!: number;

  onSubmit() {
    this.submitted = true;
    this.saveClient(this.clientForm.value);
    this.saveContacts(this.clientForm.value.contacts, this.clientForm.value.client_id);
  }

  saveClient(clientData: any) {
    const { contacts, ...allButContacts } = clientData;
    const contact_ids = contacts.map((contact: ContactTest) => contact.contact_id);
    const finalClientData = { ...allButContacts, contact_ids };
  }

  saveContacts(contactsData: any[], client_id: number) {
    const finalContactsData = contactsData.map((contact: ContactTest) => {
      const { client, ...allButClient } = contact;
      return { ...allButClient, client_id };
    });
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
    this.clientForm.reset();
    this.submitted = false;
  }

  addContact(): void {
    this.contacts.push(this.newContact());
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  constructor(private fb: FormBuilder, private router: Router) {
    this.client_id = Date.now();
  }

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
      jobs: this.fb.array([]),
      contacts: this.fb.array([]),
    });
  }
}
