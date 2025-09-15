import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true,
})
export class Navbar implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  @Input() title: string | undefined;
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const activeLink = document.querySelector(`.ar-nav-link[routerLink="${event.url}"]`);
        activeLink?.setAttribute('aria-current', 'page');
        activeLink?.classList.add('active');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
