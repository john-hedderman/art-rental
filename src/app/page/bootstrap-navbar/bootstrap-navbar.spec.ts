import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BootstrapNavbar } from './bootstrap-navbar';

describe('BootstrapNavbar', () => {
  let component: BootstrapNavbar;
  let fixture: ComponentFixture<BootstrapNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BootstrapNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BootstrapNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
