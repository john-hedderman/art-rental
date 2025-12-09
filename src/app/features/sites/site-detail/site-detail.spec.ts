import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { SiteDetail } from './site-detail';

describe('SiteDetail', () => {
  let component: SiteDetail;
  let fixture: ComponentFixture<SiteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
