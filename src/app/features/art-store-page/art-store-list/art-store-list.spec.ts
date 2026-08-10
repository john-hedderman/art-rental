import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { ArtStoreList } from './art-store-list';

describe('ArtStoreList', () => {
  let component: ArtStoreList;
  let fixture: ComponentFixture<ArtStoreList>;
  let store: MockStore;

  const initialState = {
    data: {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtStoreList],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ArtStoreList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
