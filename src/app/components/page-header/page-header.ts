import { Component, Input } from '@angular/core';

import { HeaderButton } from '../../model/models';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  @Input() headerTitle = '';
  @Input() headerButtons: HeaderButton[] = [];
}
