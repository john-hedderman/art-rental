import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtList } from './art-list';

describe('ArtList', () => {
  let component: ArtList;
  let fixture: ComponentFixture<ArtList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
