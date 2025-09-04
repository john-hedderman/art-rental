import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-clients-page',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
})
export class ClientsPage {
  headerText = 'Select a client to see details';
  addButtonText = 'Create a new client';
}
