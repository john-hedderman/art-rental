import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SitesNgrxList } from './sites-ngrx-list';

describe('SitesNgrxList', () => {
  let component: SitesNgrxList;
  let fixture: ComponentFixture<SitesNgrxList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitesNgrxList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SitesNgrxList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
