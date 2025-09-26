import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtList } from './art-list';
import { provideHttpClient } from '@angular/common/http';

describe('ArtList', () => {
  let component: ArtList;
  let fixture: ComponentFixture<ArtList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
