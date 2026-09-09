import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsNgrxPage } from './tags-ngrx-page';

describe('TagsNgrx', () => {
  let component: TagsNgrxPage;
  let fixture: ComponentFixture<TagsNgrxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsNgrxPage]
    }).compileComponents();

    fixture = TestBed.createComponent(TagsNgrxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
