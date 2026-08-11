import { Component, Input, output, ChangeDetectionStrategy } from '@angular/core';
import { ITag } from '../../../model/models';

@Component({
  selector: 'app-tag-pill',
  imports: [],
  templateUrl: './tag-pill.html',
  styleUrl: './tag-pill.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class TagPill {
  @Input() tag!: ITag;
  @Input() action: string = '';

  onDeleteClicked = output<number>();
}
