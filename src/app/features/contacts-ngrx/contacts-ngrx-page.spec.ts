import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsNgrxPage } from './contacts-ngrx-page';

describe('ClientsNgrxPage', () => {
  let component: ContactsNgrxPage;
  let fixture: ComponentFixture<ContactsNgrxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsNgrxPage]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsNgrxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
