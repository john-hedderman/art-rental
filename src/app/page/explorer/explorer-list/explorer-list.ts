import { Component } from '@angular/core';

@Component({
  selector: 'app-explorer-list',
  templateUrl: './explorer-list.html',
  styleUrl: './explorer-list.scss',
  standalone: true,
})
export class ExplorerList {
  items: any[] = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
}
