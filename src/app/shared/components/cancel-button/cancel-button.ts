import { Component, inject } from '@angular/core';
import { ActionButton } from '../../actions/action-data';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cancel-button',
  imports: [],
  templateUrl: './cancel-button.html',
  styleUrl: './cancel-button.scss',
  standalone: true,
})
export class CancelButton extends ActionButton {
  goBack = () => this.location.back();
  location = inject(Location);

  constructor() {
    super(
      'cancelBtn',
      'Cancel',
      'button',
      'btn btn-outline-secondary ms-3',
      false,
      null,
      null,
      null
    );
    this.clickHandler = this.goBack;
  }
}
