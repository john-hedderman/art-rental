import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditContact } from './add-edit-contact';

describe('AddEditContact', () => {
  let component: AddEditContact;
  let fixture: ComponentFixture<AddEditContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditContact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
