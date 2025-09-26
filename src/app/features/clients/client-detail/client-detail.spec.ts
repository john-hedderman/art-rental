import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetail } from './client-detail';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('ClientDetail', () => {
  let component: ClientDetail;
  let fixture: ComponentFixture<ClientDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
