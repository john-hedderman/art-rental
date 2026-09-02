import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Art2List } from './art2-list';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../../core/+state/core-state';

describe('Art2List', () => {
  let component: Art2List;
  let fixture: ComponentFixture<Art2List>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Art2List],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(Art2List);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
