import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TagList } from './tag-list';

describe('TagList', () => {
  let component: TagList;
  let fixture: ComponentFixture<TagList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagList],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(TagList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
