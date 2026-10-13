import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SitesNgrxPage } from './sites-ngrx-page';

describe('SitesNgrxPage', () => {
  let component: SitesNgrxPage;
  let fixture: ComponentFixture<SitesNgrxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitesNgrxPage]
    }).compileComponents();

    fixture = TestBed.createComponent(SitesNgrxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
