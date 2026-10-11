import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Observable, Subject, take, takeUntil, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { IClient, IContact } from '../../../model/models';
import { selectClients } from '../../../core/+state/core.selectors';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { SaveButton } from '../../../shared/buttons/save-button';
import { ResetButton } from '../../../shared/buttons/reset-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { selectContactById } from '../+state/contacts-ngrx.selectors';
import { ContactsNgrxActions } from '../+state/contacts-ngrx.actions';
import { selectClientById } from '../../clients-ngrx/+state/clients-ngrx.selectors';

@Component({
  imports: [PageHeader, ReactiveFormsModule, RouterLink, AsyncPipe, PageFooter],
  selector: 'app-add-contact-ngrx',
  styleUrl: './add-contact-ngrx.scss',
  templateUrl: './add-contact-ngrx.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class AddContactNgrx extends AddBase implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  goToContactList = () => this.router.navigate(['/contacts-ngrx', 'list']);
  contactListLink = new ActionLink(
    'contactListLink',
    'Contacts',
    '/contacts/list',
    '',
    this.goToContactList
  );
  headerData = new HeaderActions('contact-add', 'Add Contact', [], [this.contactListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  contactForm!: FormGroup;

  contactId!: number;

  editMode = false;

  contact$: Observable<IContact> | undefined;
  clients$: Observable<IClient[]> | undefined;

  destroy$ = new Subject<void>();

  override dbData: IContact = {} as IContact;

  override submitted = false;

  override saveStatus = '';

  override populateData(): void {}

  override resetForm(): void {}

  override preSave() {
    this.disableSaveBtn();

    if (!this.contactId) {
      const contactId = this.route.snapshot.paramMap.get('id');
      this.contactId = contactId ? +contactId : Date.now();
    }

    this.contactForm.value.contact_id = this.contactId;

    // const contactId = this.route.snapshot.paramMap.get('id');
    // this.contactId = contactId ? +contactId : Date.now();
    // this.contactForm.value.contact_id = this.contactId;
    // this.contactForm.value.client_id = parseInt(this.contactForm.value.client_id);
  }

  override async save(): Promise<string> {
    this.submitted = false;
    this.saveContact();
    // FIXME: dummy return for now - will update all other pages' save() methods to be similar, relying on state.opStatus
    return '';

    // const contactStatus = await this.saveContact();
    // const oldClientStatus = this.editMode ? await this.updateOldClient() : Const.SUCCESS;
    // const clientStatus = await this.updateClient();
    // return this.jobResult([contactStatus, oldClientStatus, clientStatus]);
  }

  saveContact() {
    this.contactForm.get('contact_id')?.setValue(this.contactId);
    const contact = { ...this.contactForm.value } as IContact;
    contact.client_id = +contact.client_id;
    this.store
      .select(selectClientById(contact.client_id))
      .pipe(
        take(1),
        withLatestFrom(
          this.store.select(selectContactById(this.contactId)),
          this.store.select(selectClients)
        )
      )
      .subscribe(([newFormClient, storeContact, storeClients]) => {
        const oldStoreClient = storeClients.find((client) =>
          client.contact_ids.includes(storeContact.contact_id)
        )!;
        this.store.dispatch(
          ContactsNgrxActions.updateContact({
            isEdit: this.editMode,
            contact,
            oldClient: oldStoreClient,
            newClient: newFormClient
          })
        );
      });
  }

  onSubmit() {
    this.submitForm(this.contactForm, ['contacts', 'clients'], 'contact');
  }

  onSelectClient(event: any) {
    const clientId = event.target.value;
    if (clientId !== '') {
      this.contactForm.get('first_name')?.enable();
      this.contactForm.get('last_name')?.enable();
      this.contactForm.get('phone')?.enable();
      this.contactForm.get('title')?.enable();
      this.contactForm.get('email')?.enable();
    } else {
      this.contactForm.reset();
      this.contactForm.get('first_name')?.disable();
      this.contactForm.get('last_name')?.disable();
      this.contactForm.get('phone')?.disable();
      this.contactForm.get('title')?.disable();
      this.contactForm.get('email')?.disable();
      const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
      clientSelectEl.options[0].selected = true;
    }
  }

  onClickReset() {
    this.submitted = false;
    if (this.editMode) {
      this.store
        .select(selectContactById(this.contactId))
        .pipe(take(1))
        .subscribe((storeContactData) => {
          if (storeContactData) {
            this.contactForm.reset();
          }
          this.contactForm.patchValue(storeContactData, { emitEvent: false });
        });
    } else {
      this.contactForm.reset();
    }

    // this.resetForm();
    // const clientSelectEl = document.getElementById('client_id') as HTMLSelectElement;
    // if (this.editMode) {
    //   const clientDbId = this.dbData.client_id.toString();
    //   for (const option of clientSelectEl.options) {
    //     if (option.value === clientDbId) {
    //       option.selected = true;
    //     } else {
    //       option.selected = false;
    //     }
    //   }
    // } else {
    //   clientSelectEl.options[0].selected = true;
    // }
    // clientSelectEl.dispatchEvent(new Event('change')); // triggers onSelectClient
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.contactId = Date.now();
    this.editMode = false;

    const contactId = this.route.snapshot.paramMap.get('id');
    if (contactId) {
      this.contactId = +contactId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Contact';
    }

    // this.dataService.clients$
    //   .pipe(takeUntil(this.destroy$), distinctUntilChanged())
    //   .subscribe((clients) => {
    //     this.clients$ = of(clients);
    //     this.clients = clients;
    //   });

    this.contactForm = this.fb.group({
      contact_id: this.contactId,
      first_name: [{ value: '', disabled: this.editMode ? false : true }],
      last_name: [{ value: '', disabled: this.editMode ? false : true }],
      phone: [{ value: '', disabled: this.editMode ? false : true }],
      title: [{ value: '', disabled: this.editMode ? false : true }],
      email: [{ value: '', disabled: this.editMode ? false : true }],
      client_id: ['', { nonNullable: true }]
    });

    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));

    this.contact$ = this.store.select(selectContactById(this.contactId));
    this.clients$ = this.store.select(selectClients).pipe(takeUntil(this.destroy$));

    this.contact$.subscribe((contactData: IContact) => {
      if (this.editMode) {
        if (contactData) {
          // if (clientData.contacts) {
          //   this.contacts.clear();
          //   for (let contact of clientData.contacts) {
          //     this.addContactControl(contact.contact_id);
          //   }
          // }
          this.contactForm.patchValue(contactData, { emitEvent: false });
        }
      }
    });

    // if (this.editMode) {
    //   this.populateForm<IContact>(Collections.Contacts, 'contact_id', this.contactId);
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
