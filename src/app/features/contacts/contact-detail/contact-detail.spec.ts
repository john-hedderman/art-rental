import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { ContactDetail } from './contact-detail';
import { Client, Contact } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';
import { ContactList } from '../contact-list/contact-list';
import { AddContact } from '../add-contact/add-contact';

const mockDataService = {
  clients$: of([
    { client_id: 1 },
    { client_id: 3, name: 'Comedy Club', city: 'Springfield', contact_ids: [4, 6] },
    { client_id: 5, name: 'Funny Farm' },
  ] as Client[]),
  contacts$: of([
    { contact_id: 2 },
    { contact_id: 4, client_id: 3 },
    { contact_id: 6, client_id: 3, first_name: 'Frank', last_name: 'Stein', title: 'Scary Guy' },
  ] as Contact[]),
  reloadData: () => {},
  deleteDocument: () => Promise.resolve({ deletedCount: 1 }),
  saveDocument: () => Promise.resolve({ modifiedCount: 1 }),
};

const mockActivatedRoute = {
  paramMap: of(convertToParamMap({ id: '6' })),
};

describe('ContactDetail', () => {
  let component: ContactDetail;
  let fixture: ComponentFixture<ContactDetail>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetail],
      providers: [
        provideRouter([
          { path: 'contacts/list', component: ContactList },
          { path: 'contacts/:id/edit', component: AddContact },
        ]),
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DataService, useValue: mockDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetail);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(async () => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.contactId).toBe(6);
      expect(component.clients[2].name).toBe('Funny Farm');
      const contact = await firstValueFrom(component.contact$!);
      expect(contact.client?.city).toBe('Springfield');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display the contact name', () => {
      const nameEl = fixture.nativeElement.querySelector('.ar-contact-detail__name');
      expect(nameEl.innerHTML).toContain('Frank Stein');
    });

    it('should display the contact title', () => {
      const titleEl = fixture.nativeElement.querySelector('.ar-contact-detail__title');
      expect(titleEl.innerHTML).toContain('Scary Guy');
    });
  });

  describe('Delete', () => {
    it('should perform all top level delete function', fakeAsync(() => {
      const preDeleteSpy = spyOn(component, 'preDelete');
      const deleteSpy = spyOn(component, 'delete');
      const postDeleteSpy = spyOn(component, 'postDelete');

      component.onClickDelete();

      expect(preDeleteSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
      tick(1000);
      expect(postDeleteSpy).toHaveBeenCalled();
    }));

    describe('Delete contact', () => {
      it('should fail in deleting the contact if nothing was deleted in the database', async () => {
        mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 0 });
        let deleteContactResult = await component.deleteContact();
        expect(deleteContactResult).toEqual(Const.FAILURE);
      });

      it('should delete the contact', async () => {
        mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
        const deleteContactResult = await component.deleteContact();
        expect(deleteContactResult).toEqual(Const.SUCCESS);
      });
    });

    describe('Update client', () => {
      beforeEach(() => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.init();
      });

      it('should update the client', async () => {
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.SUCCESS);
      });

      it('should fail to update the client if it cannot be found in the database', async () => {
        component.clientId = 99;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.FAILURE);
      });

      it('should fail to update the client if it was not updated in the database', async () => {
        mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toBe(Const.FAILURE);
      });
    });

    describe('After delete', () => {
      function showStatus() {
        component['messagesService'].showStatus(
          component.deleteStatus,
          Util.replaceTokens(Msgs.DELETED, { entity: 'contact' }),
          Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'contact' })
        );
        tick(1000);
        fixture.detectChanges();
      }

      it('should show a status message for a successful delete', fakeAsync(() => {
        component.deleteStatus = Const.SUCCESS;
        showStatus();
        const statusMessageEl = fixture.nativeElement.querySelector('.text-success');
        expect(statusMessageEl).toBeTruthy();
      }));

      it('should show a status message for a failed delete', fakeAsync(() => {
        component.deleteStatus = Const.FAILURE;
        showStatus();
        const statusMessageEl = fixture.nativeElement.querySelector('.text-danger');
        expect(statusMessageEl).toBeTruthy();
      }));

      it('should clear the message with the status of the delete', fakeAsync(() => {
        component.postDelete();
        tick(1000);
        fixture.detectChanges();
        let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
        expect(statusMessageEl).toBeFalsy();
      }));
    });

    describe('Comprehensive delete function', () => {
      it('should denote success if the contact was deleted and its client was updated', async () => {
        component.deleteContact = async () => Const.SUCCESS;
        component.updateClient = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.SUCCESS);
      });

      it('should denote failure if the contact was deleted but its client was not updated', async () => {
        component.deleteContact = async () => Const.SUCCESS;
        component.updateClient = async () => Const.FAILURE;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });

      it('should denote failure if the contact was not deleted', async () => {
        component.deleteContact = async () => Const.FAILURE;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to the contacts list when the Contacts link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const contactListLinkEl = fixture.nativeElement.querySelector(
        '#contactListLink'
      ) as HTMLAnchorElement;
      contactListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 'list']);
    });

    it('should navigate to the edit contact page when the Edit button in the page footer is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const editContactLinkEl = fixture.nativeElement.querySelector(
        '#editBtn'
      ) as HTMLButtonElement;
      editContactLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 6, 'edit']);
    });
  });
});
