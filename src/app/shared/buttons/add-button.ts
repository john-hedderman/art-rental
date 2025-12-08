import { ActionButton } from '../actions/action-data';

export class AddButton extends ActionButton {
  constructor(label: string, addHandler: any) {
    super('addBtn', label, 'button', 'btn btn-primary', false, null, null, addHandler);
  }
}
