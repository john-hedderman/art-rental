import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ArtistDetail } from './artist-detail';
import { DataService } from '../../../service/data-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/strings';
import { Util } from '../../../shared/util/util';

const mockDataService = {
  reloadData: () => {},
  artists$: of([
    { artist_id: 2 },
    { artist_id: 4 },
    { artist_id: 6, name: 'Claude Monet', photo_path: 'images/artists/claude-monet.jpg', tags: '' }
  ]),
  tags$: of([])
};

const mockActivatedRoute = {
  paramMap: of(
    convertToParamMap({
      id: '6'
    })
  )
};

describe('ArtistDetail', () => {
  let component: ArtistDetail;
  let fixture: ComponentFixture<ArtistDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: DataService, useValue: mockDataService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistDetail);
    component = fixture.componentInstance;
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

      expect(component.artistId).toBe(6);
      expect(component.artist.artist_id).toBe(6);
      expect(component.artist.name).toBe('Claude Monet');
    }));
  });

  describe('Populate template', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(1000);
      fixture.detectChanges();
    }));

    it('should display a picture of the artist', () => {
      const imageEl = fixture.nativeElement.querySelector('.ar-artist-detail__image-container img');
      expect(imageEl.src).toContain('images/artists/claude-monet.jpg');
    });

    it("should display the artist's name", () => {
      const artistNameEl = fixture.nativeElement.querySelector('.ar-artist-detail__artist-name p');
      expect(artistNameEl.innerHTML).toBe('Claude Monet');
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

    describe('Delete artist', () => {
      it('should delete the artist', async () => {
        component.dataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
        let deleteArtistResult = await component.deleteArtist();
        expect(deleteArtistResult).toEqual(Const.SUCCESS);
      });
    });

    describe('After delete', () => {
      it('should show a message with the status of the delete', fakeAsync(() => {
        component.deleteStatus = Const.SUCCESS;
        component['messagesService'].showStatus(
          component.deleteStatus,
          Util.replaceTokens(Msgs.DELETED, { entity: 'artist' }),
          Util.replaceTokens(Msgs.DELETE_FAILED, { entity: 'artist' })
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
      it('should denote success if the artist was deleted', async () => {
        component.deleteArtist = async () => Const.SUCCESS;

        const deleteStatus = await component.delete();
        expect(deleteStatus).toBe(Const.SUCCESS);
      });
    });
  });
});
