import { Component, input } from '@angular/core';
import { FooterActions } from '../../actions/action-data';

@Component({
  selector: 'app-buttonbar',
  imports: [],
  templateUrl: './buttonbar.html',
  styleUrl: './buttonbar.scss',
  standalone: true,
})
export class Buttonbar {
  buttonbarData = input<FooterActions>({
    buttons: [],
  });
}
