import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RouteChangeService } from '../../../service/route-change-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true,
})
export class Navbar {
  @ViewChild('navbarToggler') navbarToggler: ElementRef | undefined;

  onClickNavLink(event: PointerEvent, fromBrand?: boolean) {
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
    let target;
    if (fromBrand) {
      const brandRouterLinkValue = (event.target as HTMLElement).getAttribute('routerLink');
      target = document.querySelector(`.nav-link[routerLink="${brandRouterLinkValue}"]`);
    } else {
      target = event.target as HTMLElement;
    }
    target?.setAttribute('aria-current', 'page');
    target?.classList.add('active');
  }

  getFirstSegment(url: string | null): String {
    if (!url || url.indexOf('/') !== 0 || url === '/') {
      return '';
    }
    const relativeUrl = url.substring(1);
    const firstSlash = relativeUrl.indexOf('/');
    return firstSlash === -1 ? relativeUrl : relativeUrl.substring(0, firstSlash);
  }

  constructor(private router: Router, private routeChangesService: RouteChangeService) {
    this.routeChangesService.routeChanges$.pipe(takeUntilDestroyed()).subscribe((url) => {
      const currentRouteSegment = this.getFirstSegment(url);
      document.querySelectorAll('.ar-nav-link').forEach((link) => {
        const routerLink = link.getAttribute('routerLink');
        const routerLinkSegment = this.getFirstSegment(routerLink);
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
}
