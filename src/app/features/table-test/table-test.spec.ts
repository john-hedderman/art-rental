import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTest } from './table-test';

describe('TableTest', () => {
  let component: TableTest;
  let fixture: ComponentFixture<TableTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
