import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSiteNgrx } from './add-site-ngrx';

describe('AddSiteNgrx', () => {
  let component: AddSiteNgrx;
  let fixture: ComponentFixture<AddSiteNgrx>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSiteNgrx]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddSiteNgrx);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
