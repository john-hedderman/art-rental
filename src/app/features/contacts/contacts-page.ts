import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contacts-page',
  imports: [RouterOutlet],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class ContactsPage {}
