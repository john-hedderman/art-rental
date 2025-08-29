import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './page/navbar/navbar';
import { BootstrapNavbar } from './page/bootstrap-navbar/bootstrap-navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, BootstrapNavbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  title = 'Art for Rent';
}
