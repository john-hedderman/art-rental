import { Component, input } from '@angular/core';
import { ButtonbarData } from '../../../model/models';

@Component({
  selector: 'app-buttonbar',
  imports: [],
  templateUrl: './buttonbar.html',
  styleUrl: './buttonbar.scss',
  standalone: true,
})
export class Buttonbar {
  buttonbarData = input<ButtonbarData>({
    buttons: [],
  });
}
