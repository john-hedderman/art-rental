import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buttonbar } from './buttonbar';

describe('Buttonbar', () => {
  let component: Buttonbar;
  let fixture: ComponentFixture<Buttonbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buttonbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buttonbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
