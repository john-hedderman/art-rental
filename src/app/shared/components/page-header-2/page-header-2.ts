import { Component, input } from '@angular/core';
import { HeaderData } from '../../../model/models';

@Component({
  selector: 'app-page-header-2',
  imports: [],
  templateUrl: './page-header-2.html',
  styleUrl: './page-header-2.scss',
  standalone: true,
})
export class PageHeader2 {
  headerData = input<HeaderData>({
    headerTitle: '',
    headerButtons: [],
  });
}
