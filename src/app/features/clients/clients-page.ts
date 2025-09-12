import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-clients-page',
  imports: [RouterOutlet],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
})
export class ClientsPage {}
