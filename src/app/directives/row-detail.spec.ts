import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { RowDetail } from './row-detail';
import * as Const from '../constants';

@Component({
  standalone: true,
  imports: [RowDetail],
  template: `<div class="datatable-row-wrapper">
    <div class="row-detail-container" appRowDetail></div>
  </div>`,
})
class TestHostComponent {}

let fixture: ComponentFixture<TestHostComponent>;
let rowDetailEls: DebugElement[];

describe('RowDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    rowDetailEls = fixture.debugElement.queryAll(By.directive(RowDetail));
  });

  it('should have the directive applied to the element', () => {
    expect(rowDetailEls.length).toBe(1);
  });

  it('should show the row at a mobile breakpoint', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(Const.MOBILE_MD);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    const parentEl = rowDetailEls[0].nativeElement.parentElement as HTMLDivElement;
    expect(parentEl.classList).not.toContain('d-none');
  });

  it('should hide the row at a tablet or higher breakpoint', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(Const.TABLET);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    const parentEl = rowDetailEls[0].nativeElement.parentElement as HTMLDivElement;
    expect(parentEl.classList).toContain('d-none');
  });
});
