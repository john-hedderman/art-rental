import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-explorer-list-item',
  templateUrl: './explorer-list-item.html',
  styleUrl: './explorer-list-item.scss',
  standalone: true,
})
export class ExplorerListItem {
  @Input() data: any;
  @Input() dataType: string | undefined;
}
