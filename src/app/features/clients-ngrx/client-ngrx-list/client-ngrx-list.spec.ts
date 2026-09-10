import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientNgrxList } from './client-ngrx-list';

describe('ClientNgrxList', () => {
  let component: ClientNgrxList;
  let fixture: ComponentFixture<ClientNgrxList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientNgrxList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClientNgrxList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
