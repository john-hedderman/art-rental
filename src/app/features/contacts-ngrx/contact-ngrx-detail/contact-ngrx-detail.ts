import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, take, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions
} from '../../../shared/actions/action-data';
import { IClient, IContact } from '../../../model/models';
import { DetailBase } from '../../../shared/components/base/detail-base/detail-base';
import { selectClientByContactId, selectContactById } from '../+state/contacts-ngrx.selectors';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { DeleteButton } from '../../../shared/buttons/delete-button';
import { CoreDataActions } from '../../../core/+state/core.actions';
import { selectClients } from '../../../core/+state/core.selectors';
import { ContactsNgrxActions } from '../+state/contacts-ngrx.actions';

@Component({
  imports: [PageHeader, AsyncPipe, RouterLink, PageFooter],
  selector: 'app-contact-ngrx-detail',
  styleUrl: './contact-ngrx-detail.scss',
  templateUrl: './contact-ngrx-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ContactNgrxDetail extends DetailBase implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  goToEditContact = () => this.router.navigate(['/contacts-ngrx', this.contactId, 'edit']);
  goToContactList = () => this.router.navigate(['/contacts-ngrx', 'list']);
  contactListLink = new ActionLink(
    'contactsListLink',
    'Contacts',
    '/contacts-ngrx/list',
    '',
    this.goToContactList
  );
  headerData = new HeaderActions(
    'contact-ngrx-detail',
    'Contact detail',
    [],
    [this.contactListLink.data]
  );
  editButton = new ActionButton(
    'editBtn',
    'Edit',
    'button',
    'btn btn-primary',
    false,
    null,
    null,
    this.goToEditContact
  );
  footerData = new FooterActions([this.editButton, new DeleteButton()]);

  contact$: Observable<IContact>;
  client$: Observable<IClient | undefined>;

  contactId = 0;

  override deleteStatus = '';

  override preDelete(): void {}

  override async delete(): Promise<string> {
    this.deleteContact();
    // FIXME: dummy return for now - will update all other pages' delete() methods to be similar, relying on state.opStatus
    return '';
  }

  override postDelete() {}

  deleteContact() {
    this.store
      .select(selectContactById(this.contactId))
      .pipe(withLatestFrom(this.store.select(selectClients)), take(1))
      .subscribe(([contact, clients]) => {
        const clientItem = clients.find((client) => client.client_id === contact.client_id);
        if (clientItem) {
          const clientWithoutContact = {
            ...clientItem,
            contact_ids: clientItem.contact_ids.filter(
              (contact_id) => contact_id !== contact.contact_id
            )
          };
          delete (clientWithoutContact as any)._id;
          this.store.dispatch(
            ContactsNgrxActions.deleteContact({
              contact,
              client: clientWithoutContact
            })
          );
        }
      });
  }

  setContactId() {
    const contactId = this.route.snapshot.paramMap.get('id');
    this.contactId = contactId ? +contactId : 0;
  }

  async onClickDelete() {
    this.deleteAndReload(['contacts', 'clients'], this.goToContactList);
  }

  constructor() {
    super();
    this.setContactId();
    this.contact$ = this.store.select(selectContactById(this.contactId));
    this.client$ = this.store.select(selectClientByContactId(this.contactId));
  }

  ngOnInit(): void {
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: false }));
  }

  ngOnDestroy(): void {}
}
