import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-add-client',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient implements OnInit {
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

  onSubmit() {
    this.clientForm.value.client_id = Date.now();
    this.submitted = true;
    if (this.clientForm.valid) {
      this.saveClient(this.clientForm.value);
      this.saveContacts(this.clientForm.value.contacts, this.clientForm.value.client_id);
      this.resetForm();
    }
  }

  saveClient(clientData: any) {
    const collectionName = Collections.Clients;
    const { contacts, ...allButContacts } = clientData;
    const contact_ids = contacts.map((contact: ContactTest) => contact.contact_id);
    const finalClientData = { ...allButContacts, contact_ids, job_ids: [] };
    this.dataService.saveDocument(finalClientData, collectionName);
  }

  saveContacts(contactsData: any[], client_id: number) {
    const collectionName = Collections.ContactsInsertTest;
    const finalContactsData = contactsData.map((contact: ContactTest) => {
      const { client, ...allButClient } = contact;
      return { ...allButClient, client_id };
    });
    for (const contact of finalContactsData) {
      this.dataService.saveDocument(contact, collectionName);
    }
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
    private http: HttpClient
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
}
