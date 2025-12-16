import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AddArtist } from './add-artist';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';
import { Artist } from '../../../model/models';

const formData = {
  value: {
    artist_id: '123',
    name: 'Groucho Marx',
    photo_path: 'images/artists/groucho-marx.jpg',
    tags: 'abstract, geometry',
  },
  get: (key: string) => {},
} as FormGroup;

const route = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123',
    },
  },
} as ActivatedRoute;

describe('AddArtist', () => {
  let component: AddArtist;
  let fixture: ComponentFixture<AddArtist>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArtist],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AddArtist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.artistForm = component['fb'].group({
      artist_id: Date.now(),
      name: [''],
      photo_path: [''],
      tags: [''],
    });
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it("should display 'Edit Artist' if in edit mode", fakeAsync(() => {
      component.route = route;
      component.populateForm = () => {};
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      expect(component.editMode).toBeTrue();
      expect(component.headerData.data.headerTitle).toBe('Edit Artist');
    }));
  });

  describe('Form submission: before save', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should disable the Save button', () => {
      component.preSave();
      expect(component.saveBtn.disabled).toBeTrue();
    });

    it('should set the artist ID in the form to the route ID when in edit mode', () => {
      component.preSave();
      expect(component.artistForm.value.artist_id).toEqual(123);
    });

    it('should set the artist ID in the form to the date in ms when in add mode', () => {
      component.route = {
        snapshot: {
          paramMap: {
            get: (key: string) => null,
          },
        },
      } as ActivatedRoute;
      component.preSave();
      expect(component.artistForm.value.artist_id).not.toEqual(123);
    });
  });

  describe('Form submission: save artist', () => {
    it('should save the artist', async () => {
      component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      let saveArtistResult = await component.saveArtist();
      expect(saveArtistResult).toEqual(Const.SUCCESS);
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
        Util.replaceTokens(Msgs.SAVED, { entity: 'artist' }),
        Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'artist' })
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
      component.resetForm();
      const nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('');
      const photoPathEl = fixture.nativeElement.querySelector('#photo_path') as HTMLInputElement;
      expect(photoPathEl.value).toBe('');
    });

    it('should repopulate the form after saving in edit mode', fakeAsync(() => {
      component.editMode = true;
      const artistId = component.route.snapshot.paramMap.get('id');
      if (artistId) {
        component.artistId = +artistId;
      }
      const url = `http://localhost:3000/data/artists/${component.artistId}?recordId=artist_id`;
      const mockData = [
        {
          artist_id: 123,
          name: 'George Clooney',
          photo_path: 'images/artists/george-clooney.jpg',
          tags: 'cubist, geometry',
        } as Artist,
      ];

      component.onClickReset();
      tick(1000);
      fixture.detectChanges();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      const nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('George Clooney');

      const tagsEl = fixture.nativeElement.querySelector('#tags') as HTMLInputElement;
      expect(tagsEl.value).toBe('cubist, geometry');
    }));

    it('should perform all post-save activity (edit mode)', fakeAsync(() => {
      component.editMode = true;
      const artistId = component.route.snapshot.paramMap.get('id');
      if (artistId) {
        component.artistId = +artistId;
      }
      const url = `http://localhost:3000/data/artists/${component.artistId}?recordId=artist_id`;
      const mockData = [
        {
          artist_id: 123,
          name: 'George Clooney',
          photo_path: 'images/artists/george-clooney.jpg',
          tags: 'cubist, geometry',
        } as Artist,
      ];

      component.postSave('artist');

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockData);

      tick(1000);
      fixture.detectChanges();

      let statusMessageEl = fixture.nativeElement.querySelector('.status-message');
      expect(statusMessageEl).toBeFalsy();

      const nameEl = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
      expect(nameEl.value).toBe('George Clooney');

      const photoPathEl = fixture.nativeElement.querySelector('#photo_path') as HTMLInputElement;
      expect(photoPathEl.value).toBe('images/artists/george-clooney.jpg');
    }));
  });

  describe('Form submission, comprehensive', () => {
    beforeEach(() => {
      component.route = route;
    });

    it('should perform all form submission activity (edit mode)', fakeAsync(() => {
      const preSaveSpy = spyOn(component, 'preSave');
      const saveSpy = spyOn(component, 'save');
      const postSaveSpy = spyOn(component, 'postSave');

      component.editMode = true;
      const artistId = component.route.snapshot.paramMap.get('id');
      if (artistId) {
        component.artistId = +artistId;
      }
      const url = `http://localhost:3000/data/artists/${component.artistId}?recordId=artist_id`;
      const mockData = [
        {
          artist_id: 123,
          name: 'George Clooney',
          photo_path: 'images/artists/george-clooney.jpg',
          tags: 'cubist, geometry',
        } as Artist,
      ];

      component.artistForm.clearAsyncValidators();
      component.artistForm.clearValidators();
      component.artistForm.updateValueAndValidity();

      component.onSubmit();

      expect(preSaveSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      tick(1000);
      expect(postSaveSpy).toHaveBeenCalled();
    }));
  });
});
