import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { Tags } from './tags';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../../core/+state/core-state';

describe('Tags', () => {
  let component: Tags;
  let fixture: ComponentFixture<Tags>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tags],
      providers: [provideHttpClient(withXhr()), provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(Tags);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
