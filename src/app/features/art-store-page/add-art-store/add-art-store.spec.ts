import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArtStore } from './add-art-store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../../core/+state/core-state';
import { provideRouter } from '@angular/router';

describe('AddArtStore', () => {
  let component: AddArtStore;
  let fixture: ComponentFixture<AddArtStore>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArtStore],
      providers: [provideRouter([]), provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(AddArtStore);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
