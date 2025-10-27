import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AddSite } from './add-site';

describe('AddSite', () => {
  let component: AddSite;
  let fixture: ComponentFixture<AddSite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSite],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
