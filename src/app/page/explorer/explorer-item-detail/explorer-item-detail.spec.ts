import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerItemDetail } from './explorer-item-detail';

describe('ExplorerItemDetail', () => {
  let component: ExplorerItemDetail;
  let fixture: ComponentFixture<ExplorerItemDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerItemDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorerItemDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
