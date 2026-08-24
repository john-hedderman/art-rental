import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArtStore } from './add-art-store';

describe('AddArtStore', () => {
  let component: AddArtStore;
  let fixture: ComponentFixture<AddArtStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArtStore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArtStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
