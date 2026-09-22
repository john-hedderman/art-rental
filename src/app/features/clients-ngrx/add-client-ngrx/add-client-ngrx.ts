import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { IClient } from '../../../model/models';
import { ClientsNgrxActions } from '../+state/clients-ngrx.actions';
import { Subject, takeUntil, withLatestFrom } from 'rxjs';
import { selectClientById } from '../+state/clients-ngrx.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { selectContactsByClientId } from '../../contacts-ngrx/+state/contacts-ngrx.selectors';

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

  override submitted = false;
  override dbData: IClient = {} as IClient;
  override editMode = false;
  override saveStatus = '';
  override populateData(): void {}
  override resetForm(): void {}

  clientForm!: FormGroup;
  clientId!: number;
  destroy$ = new Subject<void>();

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
    this.submitted = false;
    if (this.editMode) {
      this.setForm();
    } else {
      this.clientForm.reset();
      this.contacts.clear();
    }
  }

  setForm() {
    this.store
      .select(selectClientById(this.clientId))
      .pipe(
        takeUntil(this.destroy$),
        withLatestFrom(this.store.select(selectContactsByClientId(this.clientId)))
      )
      .subscribe(([storeClientData, storeContactsData]) => {
        if (storeClientData) {
          this.clientForm.reset();
          while (this.contacts.length) {
            this.removeContact(0);
          }
          const contact_ids = storeContactsData.map((contact) => contact.contact_id);
          for (const contact_id of contact_ids) {
            this.addContact(contact_id);
          }
          const newClientFormData = { ...storeClientData, contacts: [...storeContactsData] };
          this.clientForm.reset(newClientFormData);
        }
      });
  }

  override preSave(): void {
    this.disableSaveBtn();
    const clientId = this.route.snapshot.paramMap.get('id');
    this.clientId = clientId ? +clientId : Date.now();
    this.clientForm.value.client_id = this.clientId;
  }

  override async save(): Promise<string> {
    this.submitted = false;
    this.saveClient();
    // FIXME: dummy return for now - will update all other pages' save() methods to be similar, relying on state.opStatus
    return '';
  }

  async saveClient() {
    this.clientForm.get('client_id')?.setValue(this.clientId);
    for (const control of this.contacts.controls) {
      control.get('client_id')?.setValue(this.clientId);
    }

    const client = { ...this.clientForm.value } as IClient;
    client.contact_ids = client.contacts?.map((contact) => contact.contact_id) || [];
    delete client.contacts;

    this.store.dispatch(
      ClientsNgrxActions.updateClient({
        isEdit: this.editMode,
        client,
        contacts: this.clientForm.value.contacts
      })
    );

    if (this.editMode) {
      setTimeout(() => {
        this.setForm();
      }, 1000);
    }
  }

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

    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));

    if (this.editMode) {
      this.setForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
