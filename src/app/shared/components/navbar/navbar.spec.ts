import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Navbar } from './navbar';
import { provideRouter, Router } from '@angular/router';
import { ArtList } from '../../../features/art/art-list/art-list';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([{ path: 'art', component: ArtList }])]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    function clickNavLink() {
      const linkEl = fixture.nativeElement.querySelector(
        '#arNavbarSupportedContent ul li:nth-of-type(2) a'
      );
      expect(linkEl).toBeTruthy();
      linkEl.click();
    }

    it('should mark the clicked link as active', fakeAsync(() => {
      clickNavLink();
      tick(1000);
      fixture.detectChanges();

      const clickedLink = fixture.nativeElement.querySelector(
        '#arNavbarSupportedContent ul li:nth-of-type(2) a'
      ) as HTMLAnchorElement;
      expect(clickedLink.classList.contains('active')).toBeTrue();

      const unclickedLink = fixture.nativeElement.querySelector(
        '#arNavbarSupportedContent ul li:nth-of-type(3) a'
      ) as HTMLAnchorElement;
      expect(unclickedLink.classList.contains('active')).toBeFalse();
    }));
  });
});
