import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AddClient } from './add-client';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Client, Contact } from '../../../model/models';
import { Util } from '../../../shared/util/util';
import { ClientList } from '../client-list/client-list';

const mockDataService = {
  saveDocument: () => Promise.resolve({ modifiedCount: 1, message: '' }),
  deleteDocuments: () => Promise.resolve({ modifiedCount: 1, message: '' }),
  reloadData: () => {},
};

const formContactsData = [
  {
    client_id: '123',
    contact_id: '2',
    email: '',
    first_name: 'Billy',
    last_name: 'Crystal',
    phone: '2125551212',
    title: '',
  },
];

const formData = {
  value: {
    client_id: '123',
    name: 'Comedy Club',
    address1: '112 68th St',
    address2: '',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    industry: 'Comedy',
    contacts: formContactsData,
  },
  get: (key: string) => {},
} as FormGroup;

const dbContactData = [
  {
    client_id: 123,
    contact_id: 2,
    email: '',
    first_name: 'Billy',
    last_name: 'Crystal',
    phone: '2125551212',
    title: '',
  } as Contact,
];

const dbData = {
  client_id: 123,
  name: 'Comedy Club',
  address1: '112 68th St',
  address2: '',
  city: 'New York',
  state: 'NY',
  zip_code: '10001',
  industry: 'Comedy',
  contacts: dbContactData,
  contact_ids: [2],
  job_ids: [],
  site_ids: [],
} as Client;

const route = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123',
    },
  },
} as ActivatedRoute;

describe('AddClient', () => {
  let component: AddClient;
  let fixture: ComponentFixture<AddClient>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClient],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataService, useValue: mockDataService },
        provideRouter([{ path: 'clients', component: ClientList }]),
      ],
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AddClient);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.clientForm = component['fb'].group({
      client_id: Date.now(),
      name: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      industry: [''],
      contacts: component['fb'].array([]),
    });
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should populate the form during initialization if in edit mode', fakeAsync(() => {
      component.route = route;
      component.populateForm = () => {};
      const populateFormSpy = spyOn(component, 'populateForm');
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
      expect(populateFormSpy).toHaveBeenCalledWith('clients', 'client_id', 123);
    }));

    it('should populate contact information in the form if in edit mode', fakeAsync(() => {
      component.route = route;

      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      const clientUrl = `http://localhost:3000/data/clients/123?recordId=client_id`;
      const clientReq = httpTestingController.expectOne(clientUrl);
      expect(clientReq.request.method).toEqual('GET');
      clientReq.flush([dbData]);

      tick(1000);

      const contactUrl = `http://localhost:3000/data/contacts/2?recordId=contact_id`;
      const contactReq = httpTestingController.expectOne(contactUrl);
      expect(contactReq.request.method).toEqual('GET');
      contactReq.flush(dbContactData);

      tick(1000);
      fixture.detectChanges();

      const firstNameEl = fixture.nativeElement.querySelector('#first_name-0') as HTMLInputElement;
      expect(firstNameEl).toBeTruthy();
      expect(firstNameEl.value).toBe('Billy');
    }));
  });

  describe('Form operations', () => {
    it('should add a contact sub-form when the Add Contact button is clicked', fakeAsync(() => {
      let firstNameEl = fixture.nativeElement.querySelector('#first_name-0') as HTMLInputElement;
      expect(firstNameEl).toBeFalsy();
      const addContactEl = fixture.nativeElement.querySelector(
        '#addContactBtn'
      ) as HTMLButtonElement;
      addContactEl.click();
      tick(1000);
      fixture.detectChanges();
      firstNameEl = fixture.nativeElement.querySelector('#first_name-0') as HTMLInputElement;
      expect(firstNameEl).toBeTruthy();
    }));

    it('should remove a contact sub-form when its Remove Contact button is clicked', fakeAsync(() => {
      const addContactEl = fixture.nativeElement.querySelector(
        '#addContactBtn'
      ) as HTMLButtonElement;
      addContactEl.click();
      tick(1000);
      fixture.detectChanges();
      let firstNameEl = fixture.nativeElement.querySelector('#first_name-0') as HTMLInputElement;
      expect(firstNameEl).toBeTruthy();
      const removeContactButtonEl = fixture.nativeElement.querySelector('#remove-contact-btn-0');
      removeContactButtonEl.click();
      tick(1000);
      fixture.detectChanges();
      firstNameEl = fixture.nativeElement.querySelector('#first_name-0') as HTMLInputElement;
      expect(firstNameEl).toBeFalsy();
    }));

    it('should reset the form when you click the Reset button', fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      let nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('');
      nameEl.value = 'CBGBs';
      expect(nameEl.value).toBe('CBGBs');

      // if ambitious, simulate clicking the Reset button, but then must handle the display
      // of a modal with a confirm button (labeled "Yes, reset") that calls onClickReset

      // const resetButtonEl = fixture.nativeElement.querySelector('#resetBtn') as HTMLButtonElement;
      // expect(resetButtonEl).toBeTruthy();
      // resetButtonEl.click();
      // resetButtonEl.dispatchEvent(new Event('click'));
      component.onClickReset();

      tick(1000);
      fixture.detectChanges();

      nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('');
    }));

    it('should repopulate the form when you click the Reset button in edit mode', fakeAsync(() => {
      component.route = route;

      component.ngOnInit();

      const clientUrl = `http://localhost:3000/data/clients/${component.clientId}?recordId=client_id`;
      let clientReq = httpTestingController.expectOne(clientUrl);
      expect(clientReq.request.method).toEqual('GET');
      clientReq.flush([dbData]);

      tick(1000);

      const contactUrl = `http://localhost:3000/data/contacts/2?recordId=contact_id`;
      const contactReq = httpTestingController.expectOne(contactUrl);
      expect(contactReq.request.method).toEqual('GET');
      contactReq.flush(dbContactData);

      tick(1000);
      fixture.detectChanges();

      let nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('Comedy Club');
      nameEl.value = '';
      expect(nameEl.value).toBe('');

      // if ambitious, simulate clicking the Reset button, but then must handle the display
      // of a modal with a confirm button (labeled "Yes, reset") that calls onClickReset

      // const resetButtonEl = fixture.nativeElement.querySelector('#resetBtn') as HTMLButtonElement;
      // expect(resetButtonEl).toBeTruthy();
      // resetButtonEl.click();
      // resetButtonEl.dispatchEvent(new Event('click'));
      component.onClickReset();

      clientReq = httpTestingController.expectOne(clientUrl);
      expect(clientReq.request.method).toEqual('GET');
      clientReq.flush([dbData]);

      tick(1000);
      fixture.detectChanges();

      nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('Comedy Club');
    }));
  });

  describe('Form submission: before save', () => {
    beforeEach(() => {
      component.clientForm = formData;
      component.route = route;
    });

    it('should disable the Save button', () => {
      component.preSave();
      expect(component.saveBtn.disabled).toBeTrue();
    });

    it('should set the client ID in the form to the route ID if present', () => {
      component.preSave();
      expect(component.clientForm.value.client_id).toEqual(123);
    });

    it('should set the client ID in the form to the date in ms when in add mode', () => {
      component.route = {
        snapshot: {
          paramMap: {
            get: (key: string) => null,
          },
        },
      } as ActivatedRoute;
      component.preSave();
      expect(component.clientForm.value.client_id).not.toEqual(123);
    });
  });

  describe('Form submission: save client', () => {
    it('should save the client in add mode', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      let saveClientResult = await component.saveClient();
      expect(saveClientResult).toEqual(Const.SUCCESS);
    });

    it('should save the client in edit mode', async () => {
      component.editMode = true;
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      let saveClientResult = await component.saveClient();
      expect(saveClientResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the client if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      let saveClientResult = await component.saveClient();
      expect(saveClientResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: delete contacts', () => {
    beforeEach(() => {
      component.clientForm = formData;
      component.dbData = dbData;
      component.route = route;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should delete all contacts', async () => {
      component.dataService.deleteDocuments = () =>
        Promise.resolve({ modifiedCount: 1, message: '' });
      const deleteContactsStatus = await component.deleteContacts();
      fixture.detectChanges();
      expect(deleteContactsStatus).toBe(Const.SUCCESS);
    });

    it('should fail to delete contacts if the database returns an indication of failure', async () => {
      component.dataService.deleteDocuments = () => Promise.resolve({ message: 'failed' });
      const deleteContactsStatus = await component.deleteContacts();
      fixture.detectChanges();
      expect(deleteContactsStatus).toBe(Const.FAILURE);
    });
  });

  describe('Form submission: save', () => {
    beforeEach(fakeAsync(() => {
      component.clientForm = formData;
      component.dbData = dbData;
      component.route = route;
      component.init();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should perform all save functionality', async () => {
      const saveClientSpy = spyOn(component, 'saveClient');
      const deleteContactsSpy = spyOn(component, 'deleteContacts');
      const saveContactsSpy = spyOn(component, 'saveContacts');

      const saveStatus = await component.save();
      expect(saveClientSpy).toHaveBeenCalled();
      expect(deleteContactsSpy).toHaveBeenCalled();
      expect(saveContactsSpy).toHaveBeenCalled();
    });

    it('should successfully save contacts if something was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ insertedId: 2 });
      component.clientForm.value.contacts = formContactsData;
      const contactsStatus = await component.saveContacts();
      fixture.detectChanges();
      expect(contactsStatus).toEqual(Const.SUCCESS);
    });

    it('should fail to save contacts if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({});
      component.clientForm.value.contacts = formContactsData;
      const contactsStatus = await component.saveContacts();
      fixture.detectChanges();
      expect(contactsStatus).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: after save', () => {
    it('should show a message with the status of the save', fakeAsync(() => {
      component.saveStatus = Const.SUCCESS;
      component.messagesService.showStatus(
        component.saveStatus,
        Util.replaceTokens(Msgs.SAVED, { entity: 'client' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'client' })
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
  });

  describe('Form submission, comprehensive', () => {
    it('should perform all post-save activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      const clientId = component.route.snapshot.paramMap.get('id');
      if (clientId) {
        component.clientId = +clientId;
      }
      const url = `http://localhost:3000/data/clients/${component.clientId}?recordId=client_id`;

      component.postSave('client');

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush([dbData]);

      tick(1000);
      fixture.detectChanges();

      let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
      expect(statusMessageEl).toBeFalsy();

      const nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('Comedy Club');

      const firstNameEl = fixture.nativeElement.querySelector('#first_name-0') as HTMLInputElement;
      expect(firstNameEl).toBeTruthy();
    }));

    it('should perform all form submission activity (edit mode)', fakeAsync(() => {
      const preSaveSpy = spyOn(component, 'preSave');
      const saveSpy = spyOn(component, 'save');
      const postSaveSpy = spyOn(component, 'postSave');

      component.editMode = true;
      component.clientId = Date.now();
      const clientId = component.route.snapshot.paramMap.get('id');
      if (clientId) {
        component.clientId = +clientId;
      }

      component.clientForm.clearAsyncValidators();
      component.clientForm.clearValidators();
      component.clientForm.updateValueAndValidity();

      component.onSubmit();

      expect(preSaveSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));
  });

  describe('Navigation', () => {
    it('should navigate to the client list when the Clients link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const clientListLinkEl = fixture.nativeElement.querySelector(
        '#clientListLink'
      ) as HTMLAnchorElement;
      clientListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/clients', 'list']);
    });
  });
});
