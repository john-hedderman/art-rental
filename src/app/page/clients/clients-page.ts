import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { PageHeader } from '../../components/page-header/page-header';

@Component({
  selector: 'app-clients-page',
  imports: [RouterOutlet, PageHeader],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.scss',
  standalone: true,
})
export class ClientsPage {
  headerTitle = 'Clients';
  headerButtonText = 'Add Client';
  navigateToAddClient = () => {
    this.router.navigate(['/clients', 'add']);
  };

  constructor(private router: Router) {}
}
