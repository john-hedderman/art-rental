import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerList } from './explorer-list';

describe('ExplorerList', () => {
  let component: ExplorerList;
  let fixture: ComponentFixture<ExplorerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorerList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
