import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-contacts-ngrx-page',
  styleUrl: './contacts-ngrx-page.scss',
  templateUrl: './contacts-ngrx-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class ContactsNgrxPage {}
