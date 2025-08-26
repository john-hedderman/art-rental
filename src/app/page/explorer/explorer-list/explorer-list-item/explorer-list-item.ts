import { Component, Input } from '@angular/core';
import { Art } from '../../../../shared/models';

@Component({
  selector: 'app-explorer-list-item',
  templateUrl: './explorer-list-item.html',
  styleUrl: './explorer-list-item.scss',
  standalone: true,
})
export class ExplorerListItem {
  @Input() art!: Art;
}
