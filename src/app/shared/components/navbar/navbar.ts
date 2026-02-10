import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { RouteChangeService } from '../../../service/route-change-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar implements OnInit, OnDestroy {
  @ViewChild('navbarToggler') navbarToggler: ElementRef | undefined;

  private readonly destroy$ = new Subject<void>();

  onClickNavLink(event: PointerEvent) {
    // Force the expanded nav to collapse by clicking the toggle button
    const toggler = this.navbarToggler?.nativeElement;
    if (toggler.checkVisibility()) {
      toggler.click();
    }

    // set class "active" and attribute "aria-current" in clicked target only
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link) => {
      link.removeAttribute('aria-current');
      link.classList.remove('active');
    });

    // Mark the clicked link as active
    const target = event.target as HTMLElement;
    target?.setAttribute('aria-current', 'page');
    target?.classList.add('active');
  }

  firstSegment(url: string | null): String {
    if (!url || url.indexOf('/') !== 0 || url === '/') {
      return '';
    }
    return url.split('/')[1];
  }

  init() {
    this.routeChangesService.routeChanges$.pipe(takeUntil(this.destroy$)).subscribe((url) => {
      const currentRouteSegment = this.firstSegment(url);
      document.querySelectorAll('.nav-link').forEach((linkEl) => {
        const toggleEl = linkEl.closest('.dropdown')?.querySelector('.dropdown-toggle');
        const routerLink = linkEl.getAttribute('routerLink');
        const routerLinkSegment = this.firstSegment(routerLink);
        if (routerLinkSegment === currentRouteSegment) {
          linkEl.classList.add('active');
          linkEl.setAttribute('aria-current', 'page');
          toggleEl?.classList.add('active');
        } else {
          linkEl.classList.remove('active');
          linkEl.removeAttribute('aria-current');
        }
      });
    });
  }

  constructor(private routeChangesService: RouteChangeService) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
