import { Component, input } from '@angular/core';
import { HeaderData } from '../../../model/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  standalone: true,
})
export class PageHeader {
  headerData = input<HeaderData>({
    headerTitle: '',
    headerButtons: [],
    headerLinks: [],
  });
}
