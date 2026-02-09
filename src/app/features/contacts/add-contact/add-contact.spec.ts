import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AddContact } from './add-contact';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { IClient, IContact } from '../../../model/models';
import { Util } from '../../../shared/util/util';
import { ContactList } from '../contact-list/contact-list';

const mockDataService = {
  clients$: of([
    { client_id: 1 },
    { client_id: 3, name: 'Comedy Club' },
    { client_id: 5 },
    { client_id: 23, name: 'Funny Farm' }
  ]),
  reloadData: () => {},
  saveDocument: () => Promise.resolve({ modifiedCount: 1 })
};

const clients = [
  { client_id: 1 },
  { client_id: 2, contact_ids: [3, 4, 5] },
  { client_id: 3 }
] as IClient[];

const formData = {
  value: {
    contact_id: '3',
    first_name: 'Frank',
    last_name: 'Stein',
    phone: '2075551212',
    title: '',
    client_id: '5'
  },
  get: (key: string) => {}
} as FormGroup;

const mockContactData = [
  {
    contact_id: 3,
    first_name: 'Frank',
    last_name: 'Stein',
    phone: '2065551212',
    title: '',
    client_id: 23
  } as IContact
];

const dbData = {
  client_id: 3
} as IContact;

const route = {
  snapshot: {
    paramMap: {
      get: (key: string) => '3'
    }
  }
} as ActivatedRoute;

describe('AddContact', () => {
  let component: AddContact;
  let fixture: ComponentFixture<AddContact>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContact, ReactiveFormsModule],
      providers: [
        provideRouter([{ path: 'contacts/list', component: ContactList }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AddContact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.clients[1].name).toBe('Comedy Club');
    }));

    it('should set edit mode when there is an id in the route', fakeAsync(() => {
      component.route = route;
      component.populateForm = () => {};
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.editMode).toBeTrue();
      expect(component.headerData.data.headerTitle).toBe('Edit Contact');
    }));
  });

  describe('Form submission: before save', () => {
    beforeEach(() => {
      component.contactForm = formData;
      component.route = route;
    });

    it('should disable the Save button', () => {
      component.preSave();
      expect(component.saveBtn.disabled).toBeTrue();
    });

    it('should set the contact ID in the form to the route ID when in edit mode', () => {
      component.preSave();
      expect(component.contactForm.value.contact_id).toBe(3);
    });

    it('should set the contact ID in the form to the date in ms when in add mode', () => {
      component.route = {
        snapshot: {
          paramMap: {
            get: (key: string) => null
          }
        }
      } as ActivatedRoute;
      component.preSave();
      expect(component.contactForm.value.contact_id).not.toBe(3);
    });

    it('should convert form IDs to numbers', () => {
      component.preSave();
      expect(component.contactForm.value.client_id).toBe(5);
    });
  });

  describe('Form submission: save', () => {
    describe('Form submission: save contact', () => {
      it('should fail to save the contact if nothing was modified in the database', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        let saveContactResult = await component.saveContact();
        expect(saveContactResult).toBe(Const.FAILURE);
      });

      it('should save the contact in add mode', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        let saveContactResult = await component.saveContact();
        expect(saveContactResult).toBe(Const.SUCCESS);
      });

      it('should save the contact in edit mode', async () => {
        component.editMode = true;
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        let saveContactResult = await component.saveContact();
        expect(saveContactResult).toBe(Const.SUCCESS);
      });
    });

    describe('Form submission: update old client', () => {
      beforeEach(() => {
        component.contactForm = formData;
        component.dbData = dbData;
        component.clients = clients;
      });

      it('should skip saving the old client if the client did not change (edit mode)', async () => {
        component.editMode = true;
        component.contactForm = {
          value: {
            client_id: '3'
          }
        } as FormGroup;
        component.preSave();
        const updateOldClientResult = await component.updateOldClient();
        expect(updateOldClientResult).toBe(Const.SUCCESS);
      });

      it('should fail saving the old job if it cannot be found in the database', async () => {
        component.dbData = {
          client_id: 99
        } as IContact;
        const updateOldClientResult = await component.updateOldClient();
        expect(updateOldClientResult).toBe(Const.FAILURE);
      });

      it('should successfully save the old client if something was modified in the database', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.dbData = {
          client_id: 2
        } as IContact;
        component.contactForm = {
          value: {
            contact_id: '3'
          }
        } as FormGroup;
        const updateOldClientResult = await component.updateOldClient();
        expect(updateOldClientResult).toEqual(Const.SUCCESS);
      });

      it('should fail to save the old client if nothing was modified in the database', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        component.dbData = {
          client_id: 2
        } as IContact;
        component.contactForm = {
          value: {
            contact_id: '3'
          }
        } as FormGroup;
        const updateOldClientResult = await component.updateOldClient();
        expect(updateOldClientResult).toEqual(Const.FAILURE);
      });
    });

    describe('Form submission: update new client', () => {
      beforeEach(() => {
        component.contactForm = formData;
        component.dbData = dbData;
        component.clients = clients;
      });

      it('should fail to save the new client if it cannot be found in the database', async () => {
        component.contactForm = {
          value: {
            client_id: '99'
          }
        } as FormGroup;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toEqual(Const.FAILURE);
      });

      it('should fail to save the new client if nothing was modified in the database', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        component.dbData = {
          client_id: 2
        } as IContact;
        component.contactForm = {
          value: {
            contact_id: '3'
          }
        } as FormGroup;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toEqual(Const.FAILURE);
      });

      it('should fail to update the new client if nothing was modified in the database', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        component.contactForm = {
          value: {
            client_id: 2
          }
        } as FormGroup;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toEqual(Const.FAILURE);
      });

      it('should update the new client', async () => {
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        component.contactForm = {
          value: {
            client_id: 2
          }
        } as FormGroup;
        const updateClientResult = await component.updateClient();
        expect(updateClientResult).toEqual(Const.SUCCESS);
      });
    });

    describe('Form submission: save all data', () => {
      it('should perform all save activity', async () => {
        component.editMode = true;

        const contactSpy = spyOn(component, 'saveContact');
        const oldClientSpy = spyOn(component, 'updateOldClient');
        const newClientSpy = spyOn(component, 'updateClient');

        const saveStatus = await component.save();

        expect(contactSpy).toHaveBeenCalled();
        expect(oldClientSpy).toHaveBeenCalled();
        expect(newClientSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Form submission: after save', () => {
    it('should show a message with the status of the save', fakeAsync(() => {
      component.saveStatus = Const.SUCCESS;
      component.messagesService.showStatus(
        component.saveStatus,
        Util.replaceTokens(Msgs.SAVED, { entity: 'contact' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'contact' })
      );
      tick(1000);
      fixture.detectChanges();
      const statusMessageEl = fixture.nativeElement.querySelector('.text-success');
      expect(statusMessageEl).toBeTruthy();
    }));

    it('should clear the message with the status of the save', fakeAsync(() => {
      component.messagesService.clearStatus();
      tick(1000);
      fixture.detectChanges();
      let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
      expect(statusMessageEl).toBeFalsy();
    }));

    it('should clear the form after saving in add mode', () => {
      component.onClickReset();
      const clientEl = fixture.nativeElement.querySelector('#client_id') as HTMLSelectElement;
      expect(clientEl.value).toBe('');

      const firstNameEl = fixture.nativeElement.querySelector('#first_name') as HTMLInputElement;
      expect(firstNameEl.value).toBe('');
    });

    it('should repopulate the form after saving in edit mode', fakeAsync(() => {
      component.editMode = true;
      component.dbData = dbData;
      const url = `http://localhost:3000/data/contacts/${component.contactId}?recordId=contact_id`;
      const mockData = mockContactData;

      component.onClickReset();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      tick(1000);
      fixture.detectChanges();

      const clientEl = fixture.nativeElement.querySelector('#client_id') as HTMLSelectElement;
      expect(clientEl.value).toBe('23');
      expect(clientEl.selectedOptions[0].innerHTML).toBe('Funny Farm');

      const firstNameEl = fixture.nativeElement.querySelector('#first_name') as HTMLInputElement;
      expect(firstNameEl.value).toBe('Frank');
    }));
  });

  describe('Form submission, comprehensive', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should perform all post-save activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      const url = `http://localhost:3000/data/contacts/${component.contactId}?recordId=contact_id`;
      const mockData = mockContactData;

      component.postSave('contact');

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      tick(1000);
      fixture.detectChanges();

      const clientEl = fixture.nativeElement.querySelector('#client_id') as HTMLSelectElement;
      expect(clientEl.value).toBe('23');
      expect(clientEl.selectedOptions[0].innerHTML).toBe('Funny Farm');

      const firstNameEl = fixture.nativeElement.querySelector('#first_name') as HTMLInputElement;
      expect(firstNameEl.value).toBe('Frank');
    }));

    it('should perform all form submission activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      component.contactForm = component['fb'].group({
        contact_id: Date.now(),
        first_name: 'Frank',
        last_name: 'Stein',
        phone: '2065551212',
        title: '',
        email: '',
        client_id: null
      });

      const preSaveSpy = spyOn(component, 'preSave');
      const saveSpy = spyOn(component, 'save');
      const postSaveSpy = spyOn(component, 'postSave');

      component.contactForm.clearAsyncValidators();
      component.contactForm.clearValidators();
      component.contactForm.updateValueAndValidity();

      component.onSubmit();

      expect(preSaveSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));
  });

  describe('Navigation', () => {
    it('should navigate to the contact list when the Contacts link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const contactListLinkEl = fixture.nativeElement.querySelector(
        '#contactListLink'
      ) as HTMLAnchorElement;
      contactListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/contacts', 'list']);
    });
  });
});
