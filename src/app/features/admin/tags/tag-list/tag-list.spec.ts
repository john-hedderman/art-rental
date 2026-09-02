import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { TagList } from './tag-list';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../../../core/+state/core-state';

describe('TagList', () => {
  let component: TagList;
  let fixture: ComponentFixture<TagList>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagList],
      providers: [provideHttpClient(withXhr()), provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(TagList);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
