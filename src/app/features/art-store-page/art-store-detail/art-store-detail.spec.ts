import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtStoreDetail } from './art-store-detail';

describe('ArtStoreDetail', () => {
  let component: ArtStoreDetail;
  let fixture: ComponentFixture<ArtStoreDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtStoreDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtStoreDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
