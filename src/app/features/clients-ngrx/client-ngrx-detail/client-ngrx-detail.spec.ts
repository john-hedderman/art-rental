import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientNgrxDetail } from './client-ngrx-detail';

describe('ClientNgrxDetail', () => {
  let component: ClientNgrxDetail;
  let fixture: ComponentFixture<ClientNgrxDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientNgrxDetail]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClientNgrxDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
