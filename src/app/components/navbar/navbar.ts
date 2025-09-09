import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true,
})
export class Navbar implements OnInit {
  @Input() title: string | undefined;
  @ViewChild('navbarToggler') navbarToggler: ElementRef | undefined;

  onClickNavLink(event: PointerEvent) {
    // Force the expanded nav to collapse by clicking the toggle button
    // Otherwise it is displayed already expanded at a larger breakpoint, relevant when rotating a tablet to landscape
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
    const target = event.target as HTMLElement;
    target.setAttribute('aria-current', 'page');
    target.classList.add('active');
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const activeLink = document.querySelector(`[routerLink="${event.url}"]`);
        activeLink?.setAttribute('aria-current', 'page');
        activeLink?.classList.add('active');
      });
  }
}
