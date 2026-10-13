import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiteNgrxDetail } from './site-ngrx-detail';

describe('SiteNgrxDetail', () => {
  let component: SiteNgrxDetail;
  let fixture: ComponentFixture<SiteNgrxDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteNgrxDetail]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SiteNgrxDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
