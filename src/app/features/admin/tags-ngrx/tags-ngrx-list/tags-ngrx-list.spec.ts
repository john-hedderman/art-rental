import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsNgrxList } from './tags-ngrx-list';

describe('TagsNgrxList', () => {
  let component: TagsNgrxList;
  let fixture: ComponentFixture<TagsNgrxList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsNgrxList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagsNgrxList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
