import { Component } from '@angular/core';
import { ActionButton } from '../../actions/action-data';

@Component({
  selector: 'app-save-button',
  imports: [],
  templateUrl: './save-button.html',
  styleUrl: './save-button.scss',
  standalone: true,
})
export class SaveButton extends ActionButton {
  constructor() {
    super('saveBtn', 'Save', 'submit', 'btn btn-primary', false, null, null, null);
  }
}
