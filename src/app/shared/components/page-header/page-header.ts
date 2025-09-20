import { Component, input } from '@angular/core';
import { HeaderData } from '../../../model/models';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  headerData = input<HeaderData>({
    headerTitle: '',
    headerButtons: [],
  });
}
