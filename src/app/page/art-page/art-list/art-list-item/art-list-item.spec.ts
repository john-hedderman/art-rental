import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtListItem } from './art-list-item';

describe('ArtListItem', () => {
  let component: ArtListItem;
  let fixture: ComponentFixture<ArtListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
