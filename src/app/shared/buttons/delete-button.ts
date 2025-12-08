import { ActionButton } from '../actions/action-data';

export class DeleteButton extends ActionButton {
  constructor() {
    super(
      'deleteBtn',
      'Delete',
      'button',
      'btn btn-danger ms-3',
      false,
      'modal',
      '#confirmModal',
      null
    );
  }
}
