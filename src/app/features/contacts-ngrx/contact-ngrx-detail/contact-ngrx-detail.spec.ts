import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactNgrxDetail } from './contact-ngrx-detail';

describe('ContactNgrxDetail', () => {
  let component: ContactNgrxDetail;
  let fixture: ComponentFixture<ContactNgrxDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactNgrxDetail]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ContactNgrxDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
