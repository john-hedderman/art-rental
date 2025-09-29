import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesPage } from './sites-page';

describe('SitesPage', () => {
  let component: SitesPage;
  let fixture: ComponentFixture<SitesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SitesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
