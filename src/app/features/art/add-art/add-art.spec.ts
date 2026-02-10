import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AddArt } from './add-art';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { IArt, IJob } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { Util } from '../../../shared/util/util';
import { of } from 'rxjs';

const formData = {
  value: {
    art_id: '1',
    artist_id: '2',
    job_id: '3',
    file_name: 'aaa.jpg'
  },
  get: (key: string) => {}
} as FormGroup;

const route = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123'
    }
  }
} as ActivatedRoute;

const dbData = {
  job_id: 23
} as IArt;

describe('AddArt', () => {
  let component: AddArt;
  let fixture: ComponentFixture<AddArt>;
  let httpTestingController: HttpTestingController;

  const mockDataService = {
    saveDocument: () => Promise.resolve({ modifiedCount: 1 }),
    reloadData: () => {},
    artists$: of([{ artist_id: 4 }, { artist_id: 5 }, { artist_id: 6 }]),
    jobs$: of([{ job_id: 1 }, { job_id: 2, client_id: 1, site_id: 2 }, { job_id: 3 }]),
    clients$: of([{ client_id: 1 }, { client_id: 7 }, { client_id: 8 }]),
    sites$: of([{ site_id: 9 }, { site_id: 2 }, { site_id: 10 }])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArt, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AddArt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.artForm = component['fb'].group({
      art_id: Date.now(),
      title: [''],
      file_name: [''],
      full_size_image_url: [''],
      artist_id: [null],
      job_id: [null],
      tags: ['']
    });
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

      expect(component.jobs[0].job_id).toBe(1);
      expect(component.jobs[1].job_id).toBe(2);

      component.artists$?.subscribe((artists) => {
        expect(artists[0].artist_id).toBe(4);
      });

      component.route = route;
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.editMode).toBeTrue();
      expect(component.headerData.data.headerTitle).toBe('Edit Art');
    }));
  });

  describe('Form submission: before save', () => {
    beforeEach(() => {
      component.artForm = formData;
      component.route = route;
    });

    it('should disable the Save button', () => {
      component.preSave();
      expect(component.saveBtn.disabled).toBeTrue();
    });

    it('should set the art ID in the form to the route ID when in edit mode', () => {
      component.preSave();
      expect(component.artForm.value.art_id).toEqual(123);
    });

    it('should set the art ID in the form to the date in ms when in add mode', () => {
      component.route = {
        snapshot: {
          paramMap: {
            get: (key: string) => null
          }
        }
      } as ActivatedRoute;
      component.preSave();
      expect(component.artForm.value.art_id).not.toEqual(123);
    });

    it('should convert form IDs to numbers', () => {
      component.preSave();
      expect(component.artForm.value.artist_id).toEqual(2);
      expect(component.artForm.value.job_id).toEqual(3);
    });

    it('should set the file name correctly depending on whether "TBD" is checked or unchecked', fakeAsync(() => {
      const checkboxEl = fixture.nativeElement.querySelector('#file_name_tbd') as HTMLInputElement;

      component.artForm.value.file_name = 'aaa.jpg';
      checkboxEl.checked = true;
      checkboxEl.dispatchEvent(new Event('change'));
      tick(1000);
      component.preSave();
      expect(component.artForm.value.file_name).toEqual('no-image-available.jpg');

      component.artForm.value.file_name = 'aaa.jpg';
      checkboxEl.checked = false;
      checkboxEl.dispatchEvent(new Event('change'));
      tick(1000);
      component.preSave();
      expect(component.artForm.value.file_name).toEqual('aaa.jpg');
    }));
  });

  describe('Form submission: save art', () => {
    it('should save the art', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      let saveArtResult = await component.saveArt();
      expect(saveArtResult).toEqual(Const.SUCCESS);
    });
  });

  describe('Form submission: update old job', () => {
    beforeEach(() => {
      component.artForm = formData;
      component.dbData = dbData;
    });

    it('should not save the old job if the job assignment did not change', async () => {
      component.artForm = {
        value: {
          job_id: 23
        }
      } as FormGroup;
      const updateOldJobResult = await component.updateOldJob();
      expect(updateOldJobResult).toEqual(Const.SUCCESS);
    });

    it('should not save the old job if the art was not previously assigned to a job', async () => {
      component.dbData = {
        job_id: Const.NO_JOB
      } as IArt;
      const updateOldJobResult = await component.updateOldJob();
      expect(updateOldJobResult).toEqual(Const.SUCCESS);
    });

    it('should fail saving the old job if it cannot be found in the database', async () => {
      component.jobs = [{ job_id: 1 }, { job_id: 2 }, { job_id: 3 }] as IJob[];
      component.dbData = {
        job_id: 99
      } as IArt;
      const updateOldJobResult = await component.updateOldJob();
      expect(updateOldJobResult).toEqual(Const.FAILURE);
    });

    it('should successfully save the old job if something was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      component.jobs = [{ job_id: 1 }, { job_id: 2 }, { job_id: 3, art_ids: [5, 6, 7] }] as IJob[];
      component.dbData = {
        job_id: 3
      } as IArt;
      component.artForm = {
        value: {
          art_id: 7
        }
      } as FormGroup;
      const updateOldJobResult = await component.updateOldJob();
      expect(updateOldJobResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the old job if nothing was modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      component.jobs = [{ job_id: 1 }, { job_id: 2 }, { job_id: 3, art_ids: [5, 6, 7] }] as IJob[];
      component.dbData = {
        job_id: 3
      } as IArt;
      component.artForm = {
        value: {
          art_id: 7
        }
      } as FormGroup;
      const updateOldJobResult = await component.updateOldJob();
      expect(updateOldJobResult).toEqual(Const.FAILURE);
    });
  });

  describe('Form submission: update new job', () => {
    beforeEach(() => {
      component.artForm = formData;
      component.dbData = dbData;
    });

    it('should not save the new job if the job assignment did not change', async () => {
      component.artForm = {
        value: {
          job_id: 23
        }
      } as FormGroup;
      const updateNewJobResult = await component.updateJob();
      expect(updateNewJobResult).toEqual(Const.SUCCESS);
    });

    it('should not save the new job if the art was only removed from a job and not assigned to a new one', async () => {
      component.artForm = {
        value: {
          job_id: Const.NO_JOB
        }
      } as FormGroup;
      const updateNewJobResult = await component.updateJob();
      expect(updateNewJobResult).toEqual(Const.SUCCESS);
    });

    it('should fail to save the new job if it cannot be found in the database', async () => {
      component.jobs = [{ job_id: 1 }, { job_id: 2 }, { job_id: 3 }] as IJob[];
      component.artForm = {
        value: {
          job_id: 4
        }
      } as FormGroup;
      const updateNewJobResult = await component.updateJob();
      expect(updateNewJobResult).toEqual(Const.FAILURE);
    });

    it('should fail to save the new job if nothing was ultimately modified in the database', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      component.jobs = [{ job_id: 1 }, { job_id: 2 }, { job_id: 3, art_ids: [5, 6, 7] }] as IJob[];
      component.dbData = {
        job_id: 4
      } as IArt;
      component.artForm = {
        value: {
          job_id: 3,
          art_id: 8
        }
      } as FormGroup;
      const updateNewJobResult = await component.updateJob();
      expect(updateNewJobResult).toEqual(Const.FAILURE);
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
        Util.replaceTokens(Msgs.SAVED, { entity: 'art' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'art' })
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
      const titleInputEl = fixture.nativeElement.querySelector('#title') as HTMLInputElement;
      expect(titleInputEl.value).toBe('');
      const fileNameInputEl = fixture.nativeElement.querySelector('#file_name') as HTMLInputElement;
      expect(fileNameInputEl.value).toBe('');
    });

    it('should repopulate the form after saving in edit mode', fakeAsync(() => {
      component.editMode = true;
      const artId = component.route.snapshot.paramMap.get('id');
      if (artId) {
        component.artId = +artId;
      }
      const url = `http://localhost:3000/data/art/${component.artId}?recordId=art_id`;
      const mockData = [
        {
          art_id: 123,
          title: 'Obvious forgery',
          file_name: 'no-image-available.jpg',
          full_size_image_url: 'http://fake.com/forgery.jpg',
          tag_ids: [1, 2, 3],
          artist_id: 456,
          job_id: 789
        } as IArt
      ];

      component.onClickReset();
      tick(1000);
      fixture.detectChanges();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      const titleEl = fixture.nativeElement.querySelector('#title') as HTMLInputElement;
      expect(titleEl.value).toBe('Obvious forgery');

      const fileNameInputEl = fixture.nativeElement.querySelector('#file_name') as HTMLInputElement;
      expect(fileNameInputEl.value).toBe('');
    }));
  });

  describe('Form submission, comprehensive', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should perform all post-save activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      const artId = component.route.snapshot.paramMap.get('id');
      if (artId) {
        component.artId = +artId;
      }
      const url = `http://localhost:3000/data/art/${component.artId}?recordId=art_id`;
      const mockData = [
        {
          art_id: 123,
          title: 'Obvious forgery',
          file_name: 'forgery.jpg',
          full_size_image_url: 'http://fake.com/forgery.jpg',
          tag_ids: [1, 2, 3],
          artist_id: 456,
          job_id: 789
        } as IArt
      ];

      component.postSave('art');

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      tick(1000);
      fixture.detectChanges();

      let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
      expect(statusMessageEl).toBeFalsy();

      const titleInputEl = fixture.nativeElement.querySelector('#title') as HTMLInputElement;
      expect(titleInputEl.value).toBe('Obvious forgery');

      const fileNameInputEl = fixture.nativeElement.querySelector('#file_name') as HTMLInputElement;
      expect(fileNameInputEl.value).toBe('forgery.jpg');
    }));

    it('should perform all form submission activity (edit mode)', fakeAsync(() => {
      const preSaveSpy = spyOn(component, 'preSave');
      const saveSpy = spyOn(component, 'save');
      const postSaveSpy = spyOn(component, 'postSave');

      component.editMode = true;
      component.artId = Date.now();
      const artId = component.route.snapshot.paramMap.get('id');
      if (artId) {
        component.artId = +artId;
      }
      const url = `http://localhost:3000/data/art/${component.artId}?recordId=art_id`;
      const mockData = [
        {
          art_id: 123,
          title: 'Obvious forgery',
          file_name: 'forgery.jpg',
          full_size_image_url: 'http://fake.com/forgery.jpg',
          tag_ids: [1, 2, 3],
          artist_id: 456,
          job_id: 789
        } as IArt
      ];

      component.artForm.clearAsyncValidators();
      component.artForm.clearValidators();
      component.artForm.updateValueAndValidity();

      component.onSubmit();

      expect(preSaveSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));
  });
});
