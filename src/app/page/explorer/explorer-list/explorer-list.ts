import { Component, Input } from '@angular/core';

import { ExplorerListItem } from './explorer-list-item/explorer-list-item';

@Component({
  selector: 'app-explorer-list',
  imports: [ExplorerListItem],
  templateUrl: './explorer-list.html',
  styleUrl: './explorer-list.scss',
  standalone: true,
})
export class ExplorerList {
  @Input() data: any;
  @Input() title: string | undefined;
  @Input() noTitle: string | undefined;
  @Input() dataType: string | undefined;
}
