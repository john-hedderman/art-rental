import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsNgrxPage } from './clients-ngrx-page';

describe('ClientsNgrxPage', () => {
  let component: ClientsNgrxPage;
  let fixture: ComponentFixture<ClientsNgrxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsNgrxPage]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsNgrxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
