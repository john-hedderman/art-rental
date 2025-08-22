import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerItem } from './explorer-item';

describe('ExplorerItem', () => {
  let component: ExplorerItem;
  let fixture: ComponentFixture<ExplorerItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorerItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
