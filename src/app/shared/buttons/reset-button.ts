import { ActionButton } from '../actions/action-data';

export class ResetButton extends ActionButton {
  constructor() {
    super(
      'resetBtn',
      'Reset',
      'button',
      'btn btn-outline-secondary ms-3',
      false,
      'modal',
      '#confirmModal',
      null
    );
  }
}
