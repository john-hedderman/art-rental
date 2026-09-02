import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtStoreDetail } from './art-store-detail';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../../core/+state/core-state';
import { provideRouter } from '@angular/router';

describe('ArtStoreDetail', () => {
  let component: ArtStoreDetail;
  let fixture: ComponentFixture<ArtStoreDetail>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtStoreDetail],
      providers: [provideRouter([]), provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtStoreDetail);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
