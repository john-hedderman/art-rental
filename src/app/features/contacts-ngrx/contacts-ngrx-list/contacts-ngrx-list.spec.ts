import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsNgrxList } from './contacts-ngrx-list';

describe('ContactsNgrxList', () => {
  let component: ContactsNgrxList;
  let fixture: ComponentFixture<ContactsNgrxList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsNgrxList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ContactsNgrxList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
