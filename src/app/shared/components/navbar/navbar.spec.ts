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
      providers: [provideRouter([{ path: 'art', component: ArtList }])],
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
        '#arNavbarSupportedContent ul li:first-of-type a'
      );
      expect(linkEl).toBeTruthy();
      linkEl.click();
    }

    // this test works whether returning a mobile width or a greater one
    // so need to revisit and investigate not seeing any after-effects from window.resize
    it('should force the mobile nav to collapse if expanded', fakeAsync(() => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(400);
      window.dispatchEvent(new Event('resize'));
      tick(3000);
      fixture.detectChanges();

      const toggler = component.navbarToggler?.nativeElement as HTMLButtonElement;
      expect(toggler).toBeTruthy();
      expect(toggler.checkVisibility()).toBeTrue();
      const togglerSpy = spyOn(toggler, 'click');

      clickNavLink();
      expect(togglerSpy).toHaveBeenCalled();
    }));

    it('should mark the clicked link as active', fakeAsync(() => {
      clickNavLink();
      tick(1000);
      fixture.detectChanges();

      const clickedLink = fixture.nativeElement.querySelector(
        '#arNavbarSupportedContent ul li:first-of-type a'
      ) as HTMLAnchorElement;
      expect(clickedLink.classList.contains('active')).toBeTrue();

      const unclickedLink = fixture.nativeElement.querySelector(
        '#arNavbarSupportedContent ul li:nth-of-type(3) a'
      ) as HTMLAnchorElement;
      expect(unclickedLink.classList.contains('active')).toBeFalse();
    }));
  });
});
