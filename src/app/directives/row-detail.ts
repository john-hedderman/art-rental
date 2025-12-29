import { Directive, ElementRef, HostListener, inject, OnInit, Renderer2 } from '@angular/core';

import * as Const from '../constants';

@Directive({
  selector: '[appRowDetail]',
  standalone: true,
})
export class RowDetail implements OnInit {
  private el: ElementRef = inject(ElementRef);
  private renderer: Renderer2 = inject(Renderer2);

  @HostListener('window:resize', ['$event'])
  onResize(event: Event | null): void {
    const innerWidth = window.innerWidth;
    const childEl: HTMLElement = this.el.nativeElement;
    let parentEl: HTMLElement | null = childEl.parentElement;
    if (innerWidth < Const.TABLET) {
      this.renderer.removeClass(parentEl, 'd-none');
    } else {
      this.renderer.addClass(parentEl, 'd-none');
    }
  }

  constructor() {}

  ngOnInit(): void {
    this.onResize(null);
  }
}
