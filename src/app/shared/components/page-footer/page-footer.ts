import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FooterActions } from '../../actions/action-data';

@Component({
  selector: 'app-page-footer',
  imports: [],
  templateUrl: './page-footer.html',
  styleUrl: './page-footer.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'ar-page-footer'
  }
})
export class PageFooter {
  footerData = input<FooterActions>({
    buttons: []
  });
}
