import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { RouteChangeService } from '../../../service/route-change-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true,
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
      document.querySelectorAll('.ar-nav-link').forEach((link) => {
        const routerLink = link.getAttribute('routerLink');
        const routerLinkSegment = this.firstSegment(routerLink);
        if (routerLinkSegment === currentRouteSegment) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.setAttribute('aria-current', '');
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
