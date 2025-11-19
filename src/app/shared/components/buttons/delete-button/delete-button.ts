import { Component } from '@angular/core';

import { ActionButton } from '../../../actions/action-data';

@Component({
  selector: 'app-delete-button',
  imports: [],
  templateUrl: './delete-button.html',
  styleUrl: './delete-button.scss',
  standalone: true,
})
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
