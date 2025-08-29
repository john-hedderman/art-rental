import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './page/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  title = 'Art for Rent';
}
