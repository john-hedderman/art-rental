import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { SaveButton } from '../../../shared/buttons/save-button';
import { ResetButton } from '../../../shared/buttons/reset-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { IClient, IContact } from '../../../model/models';
import { ClientsNgrxActions } from '../+state/clients-ngrx.actions';
import { Observable, Subject, take, takeUntil, withLatestFrom } from 'rxjs';
import { selectClientById } from '../+state/clients-ngrx.selectors';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { selectContactsByClientId } from '../../contacts-ngrx/+state/contacts-ngrx.selectors';
import { AsyncPipe } from '@angular/common';
import { selectContacts } from '../../../core/+state/core.selectors';

@Component({
  imports: [PageHeader, ReactiveFormsModule, PageFooter, AsyncPipe],
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

  client$: Observable<IClient> | undefined;
  contacts$: Observable<IContact[]> | undefined;

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

    const formContactIds = this.clientForm.value.contacts.map(
      (contact: IContact) => contact.contact_id
    );

    const clientFormData: IClient = this.clientForm.value;
    clientFormData.contact_ids = formContactIds;

    this.store
      .select(selectContacts)
      .pipe(take(1))
      .subscribe((storeContacts) => {
        const excludedIds = new Set(formContactIds);
        const uniqueContacts = storeContacts.filter(
          (contact) => !excludedIds.has(contact.contact_id)
        );
        const allContacts = uniqueContacts.concat(this.clientForm.value.contacts);

        this.store.dispatch(
          ClientsNgrxActions.updateClientFormData({
            clientData: clientFormData,
            contactsData: allContacts
          })
        );
      });
  }

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  trackByContactId(_index: number, v: IContact) {
    return v.contact_id;
  }

  removeContact(index: number): void {
    const formContactIdsBeforeRemoval = this.clientForm.value.contacts.map(
      (contact: IContact) => contact.contact_id
    );

    this.contacts.removeAt(index);

    const formContactIdsAfterRemoval = this.clientForm.value.contacts.map(
      (contact: IContact) => contact.contact_id
    );

    const clientFormData: IClient = this.clientForm.value;
    clientFormData.contact_ids = formContactIdsAfterRemoval;

    this.store
      .select(selectContacts)
      .pipe(take(1))
      .subscribe((storeContacts) => {
        const excludedIds = new Set(formContactIdsBeforeRemoval);
        const uniqueContacts = storeContacts.filter(
          (contact) => !excludedIds.has(contact.contact_id)
        );
        const allContacts = uniqueContacts.concat(this.clientForm.value.contacts);

        this.store.dispatch(
          ClientsNgrxActions.updateClientFormData({
            clientData: clientFormData,
            contactsData: allContacts
          })
        );
      });
  }

  onClickReset() {
    this.submitted = false;
    this.client$!.pipe(take(1)).subscribe((data) => {
      this.clientForm.patchValue(data, { emitEvent: false });
    });
  }

  override preSave(): void {
    this.disableSaveBtn();

    if (!this.clientId) {
      const clientId = this.route.snapshot.paramMap.get('id');
      this.clientId = clientId ? +clientId : Date.now();
    }

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

    this.store.dispatch(
      ClientsNgrxActions.updateClient({
        isEdit: this.editMode,
        client,
        contacts: this.clientForm.value.contacts
      })
    );
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.clientId = Date.now();
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

    this.client$ = this.store
      .select(selectClientById(this.clientId))
      .pipe(takeUntil(this.destroy$));

    this.contacts$ = this.store
      .select(selectContactsByClientId(this.clientId))
      .pipe(takeUntil(this.destroy$));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
