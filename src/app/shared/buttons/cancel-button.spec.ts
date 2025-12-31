import { TestBed } from '@angular/core/testing';
import { CancelButton } from './cancel-button';

describe('CancelButton', () => {
  let cancelButton: CancelButton;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      cancelButton = new CancelButton();
    });
  });

  it('should be created', () => {
    expect(cancelButton).toBeTruthy();
  });

  it('should go back in location history when clicked', () => {
    const goBackSpy = spyOn(cancelButton['location'], 'back');
    cancelButton.clickHandler();
    expect(goBackSpy).toHaveBeenCalled();
  });
});
