import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { RowDetail } from './row-detail';

@Component({
  standalone: true,
  imports: [RowDetail],
  template: `<div class="datatable-row-wrapper">
    <div class="row-detail-container" appRowDetail></div>
  </div>`,
})
class TestHostComponent {}

let fixture: ComponentFixture<TestHostComponent>;
let des: DebugElement[];

describe('RowDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    des = fixture.debugElement.queryAll(By.directive(RowDetail));
  });

  it('should have the directive applied to the element', () => {
    expect(des.length).toBe(1);
  });
});
