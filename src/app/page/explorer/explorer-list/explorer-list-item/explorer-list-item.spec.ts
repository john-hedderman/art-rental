import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerListItem } from './explorer-list-item';

describe('ExplorerListItem', () => {
  let component: ExplorerListItem;
  let fixture: ComponentFixture<ExplorerListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorerListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
