import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddClientNgrx } from './add-client-ngrx';

describe('AddClientNgrx', () => {
  let component: AddClientNgrx;
  let fixture: ComponentFixture<AddClientNgrx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientNgrx]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddClientNgrx);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
