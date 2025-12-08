import { ActionButton } from '../actions/action-data';

export class SaveButton extends ActionButton {
  constructor() {
    super('saveBtn', 'Save', 'submit', 'btn btn-primary', false, null, null, null);
  }
}
