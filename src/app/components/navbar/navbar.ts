import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true,
})
export class Navbar {
  @Input() title: string | undefined;
  @ViewChild('navbarToggler') navbarToggler: ElementRef | undefined;

  navbarTogglerIsVisible() {
    return this.navbarToggler!.nativeElement.offsetParent !== null;
  }

  collapseNav() {
    if (this.navbarTogglerIsVisible()) {
      this.navbarToggler?.nativeElement.click();
    }
  }
}
