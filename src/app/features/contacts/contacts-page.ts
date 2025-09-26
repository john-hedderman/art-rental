import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contacts-page',
  imports: [RouterOutlet],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
  standalone: true,
})
export class ContactsPage {}
