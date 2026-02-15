import { Component, Input, output } from '@angular/core';
import { ITag } from '../../../model/models';

@Component({
  selector: 'app-tag-pill',
  imports: [],
  templateUrl: './tag-pill.html',
  styleUrl: './tag-pill.scss',
  standalone: true
})
export class TagPill {
  @Input() tag!: ITag;
  @Input() action: string = '';

  onDeleteClicked = output<number>();
}
