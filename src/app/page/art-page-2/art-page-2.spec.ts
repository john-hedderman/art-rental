import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtPage2 } from './art-page-2';

describe('ArtPage2', () => {
  let component: ArtPage2;
  let fixture: ComponentFixture<ArtPage2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtPage2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtPage2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
