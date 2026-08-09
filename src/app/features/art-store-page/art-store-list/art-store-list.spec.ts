import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtStoreList } from './art-store-list';

describe('ArtStoreList', () => {
  let component: ArtStoreList;
  let fixture: ComponentFixture<ArtStoreList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtStoreList]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtStoreList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
