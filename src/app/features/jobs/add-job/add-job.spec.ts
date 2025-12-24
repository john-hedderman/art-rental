import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormGroup } from '@angular/forms';

import { AddJob } from './add-job';
import { DataService } from '../../../service/data-service';
import { Client, Contact, Job } from '../../../model/models';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';
import { JobList } from '../job-list/job-list';

const mockDataService = {
  art$: of([
    { art_id: 20, job_id: 6 },
    { art_id: 30, job_id: 99 },
    { art_id: 40, job_id: 3 },
  ]),
  clients$: of([
    { client_id: 1, name: 'Second City' },
    { client_id: 3, name: 'Comedy Club', city: 'Springfield', contact_ids: [4, 6], job_ids: [3] },
    { client_id: 5, name: 'Funny Farm' },
  ] as Client[]),
  contacts$: of([
    { contact_id: 2, client_id: 5, first_name: 'Drac', last_name: 'Ula', title: 'Bloodsucker' },
    { contact_id: 4, client_id: 1, first_name: '', last_name: '' },
    { contact_id: 6, client_id: 3, first_name: 'Frank', last_name: 'Stein', title: 'Scary Guy' },
  ] as Contact[]),
  sites$: of([{ site_id: 10 }, { site_id: 11, client_id: 3 }, { site_id: 12 }]),
  saveDocument: () => Promise.resolve({ modifiedCount: 1 }),
  reloadData: () => {},
};

const route = {
  snapshot: {
    paramMap: {
      get: (key: string) => '3',
    },
  },
} as ActivatedRoute;

const jobForm = {
  value: {
    job_id: 3,
    job_number: '0000007',
    client_id: 3,
    site_id: 11,
    contact_ids: [6],
    art_ids: [40],
  },
  get: (key: string) => {},
} as FormGroup;

describe('AddJob', () => {
  let component: AddJob;
  let fixture: ComponentFixture<AddJob>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddJob],
      providers: [
        provideRouter([{ path: 'jobs/list', component: JobList }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataService, useValue: mockDataService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AddJob);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load all data when the component is initialized', fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.clients[1].client_id).toBe(3);
      expect(component.contacts[2].last_name).toBe('Stein');
    }));

    it('should populate the form during initialization if in edit mode', fakeAsync(() => {
      component.route = route;
      component.populateForm = () => {};
      const populateFormSpy = spyOn(component, 'populateForm');

      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(populateFormSpy).toHaveBeenCalledWith('jobs', 'job_id', 3);
      expect(component.headerData.data.headerTitle).toBe('Edit Job');
    }));
  });

  describe('Form behaviors', () => {
    it('should reset other menus if "Please select a client..." is selected in the client menu', () => {
      const resetMenusSpy = spyOn(component, 'resetMenus');

      const clientSelectEl = fixture.nativeElement.querySelector('#client_id') as HTMLSelectElement;
      clientSelectEl.value = '';
      clientSelectEl.dispatchEvent(new Event('change')); // triggers onSelectClient

      expect(resetMenusSpy).toHaveBeenCalled();
    });

    it('should reset the Contacts and Art menus if "Please select a job site..." is selected in the site menu', () => {
      const disableMenuSpy = spyOn(component, 'disableMenu');

      const siteSelectEl = fixture.nativeElement.querySelector('#site_id') as HTMLSelectElement;
      siteSelectEl.value = '';
      siteSelectEl.dispatchEvent(new Event('change')); // triggers onSelectSite

      expect(disableMenuSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form submission: before save', () => {
    it('should disable the Save button', () => {
      component.preSave();
      expect(component.saveBtn.disabled).toBeTrue();
    });

    it('should set the job ID in the form to the route ID when in edit mode', () => {
      component.route = route;
      component.preSave();
      expect(component.jobForm.value.job_id).toEqual(3);
    });

    it('should set the job ID in the form to the date in ms when in add mode', () => {
      component.route = {
        snapshot: {
          paramMap: {
            get: (key: string) => null,
          },
        },
      } as ActivatedRoute;
      component.preSave();
      expect(component.jobForm.value.job_id).not.toEqual(3);
    });
  });

  describe('Form submission: save job', () => {
    beforeEach(() => {
      component.editMode = false;
      component.jobForm = jobForm;
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
    });

    it('should save the job', async () => {
      let saveJobResult = await component.saveJob();
      expect(saveJobResult).toEqual(Const.SUCCESS);
    });

    it('should save the job in edit mode', async () => {
      component.editMode = true;
      let saveJobResult = await component.saveJob();
      expect(saveJobResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the job if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      let saveJobResult = await component.saveJob();
      expect(saveJobResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: update client', () => {
    beforeEach(() => {
      component.jobForm = jobForm;
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
    });

    it('should update the client', async () => {
      let saveClientResult = await component.updateClient();
      expect(saveClientResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the client if it cannot be found in the database', async () => {
      component.jobForm = {
        value: {
          client_id: '99',
        },
      } as FormGroup;
      const saveClientResult = await component.updateClient();
      expect(saveClientResult).toEqual(Const.FAILURE);
    });

    it('should fail to save the client if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      const saveClientResult = await component.updateClient();
      expect(saveClientResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: update site', () => {
    beforeEach(() => {
      component.jobForm = jobForm;
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
    });

    it('should update the site', async () => {
      let saveSiteResult = await component.updateSite();
      expect(saveSiteResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the site if it cannot be found in the database', async () => {
      component.jobForm = {
        value: {
          site_id: '99',
        },
      } as FormGroup;
      const saveSiteResult = await component.updateSite();
      expect(saveSiteResult).toEqual(Const.FAILURE);
    });

    it('should skip saving the site if it is TBD', async () => {
      component.jobForm = {
        value: {
          site_id: Const.TBD,
        },
      } as FormGroup;
      const saveSiteResult = await component.updateSite();
      expect(saveSiteResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the site if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      const saveSiteResult = await component.updateSite();
      expect(saveSiteResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: update art', () => {
    beforeEach(fakeAsync(() => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      component.jobForm = jobForm;
      component.jobForm.value.art_ids = [30];
      component.route = route;
    }));

    it('should update the art', async () => {
      let saveArtResult = await component.updateArt();
      expect(saveArtResult).toEqual(Const.SUCCESS);
    });

    it('should skip saving the art if it remained on the same job', async () => {
      component.jobForm = jobForm;
      let saveArtResult = await component.updateArt();
      expect(saveArtResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the art if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      const saveArtResult = await component.updateArt();
      expect(saveArtResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: save all data', () => {
    it('should perform all save activity', async () => {
      component.editMode = true;

      const jobSpy = spyOn(component, 'saveJob');
      const clientSpy = spyOn(component, 'updateClient');
      const siteSpy = spyOn(component, 'updateSite');
      const artSpy = spyOn(component, 'updateArt');

      await component.save();

      expect(jobSpy).toHaveBeenCalled();
      expect(clientSpy).toHaveBeenCalled();
      expect(siteSpy).toHaveBeenCalled();
      expect(artSpy).toHaveBeenCalled();
    });
  });

  describe('Form submission: after save', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should show a message with the status of the save', fakeAsync(() => {
      component.saveStatus = Const.SUCCESS;
      component.messagesService.showStatus(
        component.saveStatus,
        Util.replaceTokens(Msgs.SAVED, { entity: 'job' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'job' })
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
      component.editMode = false;
      component.onClickReset();

      const titleInputEl = fixture.nativeElement.querySelector('#job_number') as HTMLInputElement;
      expect(titleInputEl.value).toBe('');
      const fileNameInputEl = fixture.nativeElement.querySelector('#site_id') as HTMLInputElement;
      expect(fileNameInputEl.value).toBe('');
      expect(fileNameInputEl.disabled).toBeTrue();
    });

    it('should repopulate the form after saving in edit mode', fakeAsync(() => {
      component.editMode = true;
      component.jobId = +component.route.snapshot.paramMap.get('id')!;
      const url = `http://localhost:3000/data/jobs/${component.jobId}?recordId=job_id`;
      const mockData = [
        {
          job_id: 3,
          job_number: '0042',
          client_id: 3,
          site_id: 11,
          contact_ids: [6],
          art_ids: [40],
        } as Job,
      ];

      component.postSave('job');
      tick(1000);
      fixture.detectChanges();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      const jobNumberEl = fixture.nativeElement.querySelector('#job_number') as HTMLInputElement;
      expect(jobNumberEl.value).toBe('0042');
    }));
  });

  describe('Form submission, comprehensive', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should perform all form submission activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      component.jobForm = component['fb'].group({
        job_id: Date.now(),
        job_number: '',
        client_id: '',
        site_id: '',
        contact_ids: [],
        art_ids: [],
      });

      const preSaveSpy = spyOn(component, 'preSave');
      const saveSpy = spyOn(component, 'save');
      const postSaveSpy = spyOn(component, 'postSave');

      component.jobForm.clearAsyncValidators();
      component.jobForm.clearValidators();
      component.jobForm.updateValueAndValidity();

      component.onSubmit();

      expect(preSaveSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));
  });

  describe('Navigation', () => {
    it('should navigate to the job list when the Jobs link in the page header is clicked', async () => {
      const routerSpy = spyOn(router, 'navigate');
      const jobListLinkEl = fixture.nativeElement.querySelector(
        '#jobListLink'
      ) as HTMLAnchorElement;
      jobListLinkEl.click();
      expect(routerSpy).toHaveBeenCalledOnceWith(['/jobs', 'list']);
    });
  });
});
