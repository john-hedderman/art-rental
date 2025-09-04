import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  @Input() headerTitle = '';
  @Input() headerButtonText = '';
  @Input() btnClickHandler: any;
}
