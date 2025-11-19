import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveButton } from './save-button';

describe('SaveButton', () => {
  let component: SaveButton;
  let fixture: ComponentFixture<SaveButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
