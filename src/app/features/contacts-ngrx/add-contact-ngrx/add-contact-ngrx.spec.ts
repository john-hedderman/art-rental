import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddContactNgrx } from './add-contact-ngrx';

describe('AddContactNgrx', () => {
  let component: AddContactNgrx;
  let fixture: ComponentFixture<AddContactNgrx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContactNgrx]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddContactNgrx);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
