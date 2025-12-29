import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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

  it('should show the row detail at a mobile width', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(Const.MOBILE_MD);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    const parentElement: HTMLElement | null = des[0].nativeElement.parentElement;
    console.warn('parentElement.classList:', parentElement!.classList);
    expect(parentElement!.classList.contains('d-none')).toBeFalse();
  });

  it('should hide the row detail at a tablet or desktop width', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(Const.TABLET);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    const parentElement: HTMLElement | null = des[0].nativeElement.parentElement;
    console.warn('parentElement.classList:', parentElement!.classList);
    expect(parentElement!.classList.contains('d-none')).toBeTrue();
  });
});
