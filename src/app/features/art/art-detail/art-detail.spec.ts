import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ArtDetail } from './art-detail';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';

const artId = 5;

const artObservable = of([
  { art_id: 1 },
  { art_id: 3 },
  {
    art_id: artId,
    full_size_image_url: 'http://fake.art.com/aaa.jpg',
    job_id: 8,
    artist_id: 6,
  },
]);

const joblessArtObservable = of([
  {
    art_id: artId,
    full_size_image_url: 'http://fake.art.com/aaa.jpg',
    job_id: 0,
    artist_id: 6,
  },
]);

const mockDataService = {
  reloadData: () => {},
  art$: artObservable,
  artists$: of([{ artist_id: 2 }, { artist_id: 4 }, { artist_id: 6, name: 'Claude Monet' }]),
  jobs$: of([
    { job_id: 7 },
    { job_id: 8, job_number: '007', client_id: 10, site_id: 13, art_ids: [1, 3, 5] },
    { job_id: 9 },
  ]),
  clients$: of([{ client_id: 10 }, { client_id: 11 }, { client_id: 12 }]),
  sites$: of([{ site_id: 13 }, { site_id: 14 }, { site_id: 15 }]),
};

const mockActivatedRoute = {
  paramMap: of(
    convertToParamMap({
      id: '5',
    })
  ),
};

describe('ArtDetail', () => {
  let component: ArtDetail;
  let fixture: ComponentFixture<ArtDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: DataService, useValue: mockDataService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtDetail);
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

      expect(component.jobs[0].job_id).toBe(7);
      expect(component.jobs[1].job_id).toBe(8);

      expect(component.art.art_id).toBe(5);

      expect(component.art.job?.job_id).toBe(8);
      expect(component.art.job?.client_id).toBe(10);

      expect(component.art.artist?.artist_id).toBe(6);
      expect(component.art.artist?.name).toBe('Claude Monet');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    afterEach(() => {
      mockDataService.art$ = artObservable;
    });

    it('should display a scaled image of the piece of art', () => {
      const imageEl = fixture.nativeElement.querySelector('.ar-art-detail__image-container img');
      expect(imageEl.src).toBe('http://fake.art.com/aaa.jpg');
    });

    it("should display the artist's name", () => {
      const artistNameEl = fixture.nativeElement.querySelector('.ar-art-detail__artist-name');
      expect(artistNameEl.innerHTML).toBe('Claude Monet');
    });

    it('should display the job number if one exists', () => {
      const jobNumberEl = fixture.nativeElement.querySelector('.ar-art-detail__job-number');
      expect(jobNumberEl.innerHTML).toBe('007');
    });

    it('should not display any job information if none exists', fakeAsync(() => {
      mockDataService.art$ = joblessArtObservable;
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();

      const jobInfoEl = fixture.nativeElement.querySelector(
        '.ar-art-detail__job-info > p:first-of-type'
      ) as HTMLParagraphElement;
      expect(jobInfoEl.innerHTML).toBe('Not on a job');
    }));
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

    describe('Delete art', () => {
      it('should delete the art', async () => {
        component.dataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
        let deleteArtResult = await component.deleteArt();
        expect(deleteArtResult).toEqual(Const.SUCCESS);
      });
    });

    describe('Update job', () => {
      it('should skip removing the art from its job if it was not assigned to one', async () => {
        component.art.job_id = Const.NO_JOB;
        let updateJobResult = await component.updateJob();
        expect(updateJobResult).toEqual(Const.SUCCESS);
      });

      it('should fail to update the assigned job if it cannot be found in the database', async () => {
        component.art.job_id = 10;
        let updateJobResult = await component.updateJob();
        expect(updateJobResult).toEqual(Const.FAILURE);
      });

      it('should fail to update the assigned job if nothing was modified in the database', async () => {
        component.art.job_id = 8;
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
        let updateJobResult = await component.updateJob();
        expect(updateJobResult).toEqual(Const.FAILURE);
      });

      it('should update the assigned job', async () => {
        component.art.job_id = 8;
        component.dataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
        let updateJobResult = await component.updateJob();
        expect(updateJobResult).toEqual(Const.SUCCESS);
      });
    });

    describe('After delete', () => {
      it('should show a message with the status of the delete', fakeAsync(() => {
        component.deleteStatus = Const.SUCCESS;
        component['messagesService'].showStatus(
          component.deleteStatus,
          Util.replaceTokens(Msgs.DELETED, { entity: 'art' }),
          Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'art' })
        );
        tick(1000);
        fixture.detectChanges();
        const statusMessageEl = fixture.nativeElement.querySelector('.text-success');
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
      it('should denote success if the art was deleted and its assigned job was updated', async () => {
        component.deleteArt = async () => Const.SUCCESS;
        component.updateJob = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.SUCCESS);
      });

      it('should denote failure if the art was deleted but its assigned job was not updated', async () => {
        component.deleteArt = async () => Const.SUCCESS;
        component.updateJob = async () => Const.FAILURE;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.FAILURE);
      });
    });
  });
});
