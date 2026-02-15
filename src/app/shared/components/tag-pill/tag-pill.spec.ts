import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagPill } from './tag-pill';

describe('TagPill', () => {
  let component: TagPill;
  let fixture: ComponentFixture<TagPill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagPill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagPill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
